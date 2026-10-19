import type { Prisma } from '../../generated/prisma/client.js';
import { writeAudit } from '../../lib/audit.js';
import { badRequest,conflict,notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';

/** Keeps the teacher a member of the class's intake; called whenever a class gets a teacher. */
export async function ensureTeacherIntake(tx: Prisma.TransactionClient, teacherId: string, intakeId: string, actorId?: string) {
  await tx.teacherIntake.upsert({
    where: { teacherId_intakeId: { teacherId, intakeId } },
    create: { teacherId, intakeId, assignedById: actorId ?? null },
    update: {},
  });
}

async function loadTeacher(teacherId: string) {
  const teacher = await prisma.user.findUnique({ where: { id: teacherId }, select: { role: true, status: true } });
  if (!teacher || teacher.role !== 'TEACHER') throw notFound('Teacher not found');
  return teacher;
}

/** One click on the Teachers page: the teacher now works in this intake. Idempotent. */
export async function addTeacherIntake(teacherId: string, intakeId: string, actorId: string) {
  const teacher = await loadTeacher(teacherId);
  if (teacher.status !== 'ACTIVE') throw badRequest('Only active teachers can be added to an intake');
  const intake = await prisma.intake.findUnique({ where: { id: intakeId }, select: { isActive: true, name: true } });
  if (!intake?.isActive) throw badRequest('Choose an active intake');
  const row = await prisma.teacherIntake.upsert({
    where: { teacherId_intakeId: { teacherId, intakeId } },
    create: { teacherId, intakeId, assignedById: actorId },
    update: {},
  });
  await writeAudit({ actorId, action: 'TEACHER_INTAKE_ADDED', entityType: 'User', entityId: teacherId, after: { intakeId, intake: intake.name } });
  return row;
}

/** Refused while the teacher still runs an active class in that intake. */
export async function removeTeacherIntake(teacherId: string, intakeId: string, actorId: string) {
  await loadTeacher(teacherId);
  const blocking = await prisma.classGroup.findFirst({ where: { teacherId, intakeId, isActive: true }, select: { name: true } });
  if (blocking) throw conflict(`Move ${blocking.name} to another teacher before removing this intake`);
  await prisma.teacherIntake.deleteMany({ where: { teacherId, intakeId } });
  await writeAudit({ actorId, action: 'TEACHER_INTAKE_REMOVED', entityType: 'User', entityId: teacherId, before: { intakeId } });
  return { teacherId, intakeId };
}
