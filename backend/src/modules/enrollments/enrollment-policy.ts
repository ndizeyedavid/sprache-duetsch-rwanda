import type { Prisma } from "../../generated/prisma/client.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";

export function validateIntakeDates(value: { startDate: Date; endDate: Date; enrollmentOpensAt?: Date | null; enrollmentEndsAt?: Date | null }) {
  if (value.endDate <= value.startDate) throw badRequest("Intake end must be after its start");
  if (value.enrollmentOpensAt && value.enrollmentEndsAt && value.enrollmentEndsAt <= value.enrollmentOpensAt)
    throw badRequest("Enrolment closing must be after opening");
  if (value.enrollmentEndsAt && value.enrollmentEndsAt > value.endDate) throw badRequest("Enrolment cannot close after the intake ends");
}

export async function checkEnrollmentClass(tx: Prisma.TransactionClient, input: {
  classGroupId?: string | null; levelId: string; intakeId: string; campusId: string; active: boolean; enrollmentId?: string;
}) {
  if (!input.classGroupId) return;
  const group = await tx.classGroup.findUnique({ where: { id: input.classGroupId } });
  if (!group) throw notFound("Class group not found");
  if (group.levelId !== input.levelId || group.intakeId !== input.intakeId || group.campusId !== input.campusId)
    throw badRequest("Class must match the enrolment's level, intake and campus");
  if (input.active && !group.isActive) throw badRequest("Class group is inactive");
  const occupied = await tx.enrollment.count({ where: { classGroupId: group.id, status: "ACTIVE", ...(input.enrollmentId ? { id: { not: input.enrollmentId } } : {}) } });
  if (input.active && occupied >= group.capacity) throw conflict("This class is full");
}

export async function reconcileStudent(tx: Prisma.TransactionClient, studentId: string) {
  const current = await tx.enrollment.findFirst({ where: { studentId, status: "ACTIVE" }, orderBy: { enrolledAt: "desc" } });
  if (current) await tx.student.update({ where: { id: studentId }, data: {
    currentLevelId: current.levelId, intakeId: current.intakeId, campusId: current.campusId,
  } });
  else await tx.student.update({ where: { id: studentId }, data: { currentLevelId: null } });
}
