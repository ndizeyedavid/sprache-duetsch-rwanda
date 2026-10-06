import { academicTransaction } from "../../lib/academic-transaction.js";
import { writeAuditTx } from '../../lib/audit.js';
import { badRequest,conflict,notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
export async function listTeachingAssignments() {
  return prisma.user.findMany({ where: { role: 'TEACHER' }, select: { id: true, firstName: true, lastName: true, email: true, status: true, teachingLevels: { include: { level: { select: { id: true, code: true, title: true, isActive: true } } } }, teacherClasses: { select: { id: true, name: true, levelId: true, isActive: true, _count: { select: { enrollments: true } } } } }, orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }] });
}
export async function replaceTeachingLevels(teacherId: string, levelIds: string[], actorId: string) {
  const unique = [...new Set(levelIds)];
  return academicTransaction(async tx => {
    const teacher = await tx.user.findUnique({ where: { id: teacherId }, select: { role: true, status: true } });
    if (!teacher || teacher.role !== 'TEACHER') throw notFound('Teacher not found');
    if (teacher.status !== 'ACTIVE' && unique.length) throw badRequest('Only active teachers can receive teaching levels');
    const existing = await tx.teacherLevel.findMany({ where: { teacherId } });
    const found = await tx.level.count({ where: { id: { in: unique }, OR: [{ isActive: true }, { id: { in: existing.map(a => a.levelId) } }] } });
    if (found !== unique.length) throw badRequest('Choose existing active levels');
    const blocked = await tx.classGroup.findFirst({ where: { teacherId, isActive: true, levelId: { notIn: unique } }, select: { name: true } });
    if (blocked) throw conflict(`Reassign or deactivate ${blocked.name} before removing its teaching level`);
    await tx.teacherLevel.deleteMany({ where: { teacherId, levelId: { notIn: unique } } });
    await tx.teacherLevel.createMany({ data: unique.filter(id => !existing.some(a => a.levelId === id)).map(levelId => ({ teacherId, levelId, assignedById: actorId })) });
    await writeAuditTx(tx, { actorId, action: 'TEACHING_LEVELS_ASSIGNED', entityType: 'User', entityId: teacherId, before: { levelIds: existing.map(a => a.levelId) }, after: { levelIds: unique } });
    return tx.teacherLevel.findMany({ where: { teacherId }, include: { level: { select: { id: true, code: true, title: true } } } });
  });
}
