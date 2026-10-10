import type { Prisma } from "../../generated/prisma/client.js";
import {
assertAccountActive,
assertPaymentAccess,
assertTeacherOwnsClass,
loadStudentAccessProfile,
} from "../../lib/access.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../types/auth.js";
export const assignmentInclude = {
  classGroup: { include: { level: { select: { code: true, title: true } } } },
  createdBy: { select: { firstName: true, lastName: true } },
  recipients: true,
} satisfies Prisma.AssignmentInclude;
export const staffScope = (actor: AuthUser): Prisma.AssignmentWhereInput =>
  actor.role === "TEACHER" ? { classGroup: { teacherId: actor.id } } : {};
export const getStaffAssignment = async (actor: AuthUser, id: string) => {
  const assignment = await prisma.assignment.findFirst({
    where: { id, ...staffScope(actor) },
    include: assignmentInclude,
  });
  if (!assignment) throw notFound("Assignment not found");
  return assignment;
};
export const checkClass = async (actor: AuthUser, classGroupId: string) => {
  if (actor.role === "TEACHER") await assertTeacherOwnsClass(actor.id, classGroupId);
  const group = await prisma.classGroup.findUnique({ where: { id: classGroupId } });
  if (!group || !group.isActive) throw notFound("Active class not found");
  return group;
};
export const getStudentAssignment = async (userId: string, id: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  const assignment = await prisma.assignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });
  if (
    !assignment ||
    assignment.status !== "PUBLISHED" ||
    !profile.classGroupIds.includes(assignment.classGroupId) ||
    !profile.levelIds.includes(assignment.classGroup.levelId) ||
    (assignment.recipients.length &&
      !assignment.recipients.some((r) => r.studentId === profile.studentId))
  )
    throw notFound("Assignment not found");
  if (assignment.releaseAt && assignment.releaseAt > new Date())
    throw forbidden("This assignment is not available yet");
  assertPaymentAccess(profile, "LESSON");
  return { assignment, profile };
};
