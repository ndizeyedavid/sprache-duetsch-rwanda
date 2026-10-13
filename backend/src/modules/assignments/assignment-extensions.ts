import { env } from "../../config/env.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, notFound } from "../../lib/http-error.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../types/auth.js";
import { getStaffAssignment } from "./assignment-access.js";
import type { ExtensionInput } from "./assignments.schema.js";

type StaffAssignment = Awaited<ReturnType<typeof getStaffAssignment>>;

const formatDue = (date: Date): string =>
  `${new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: env.REMINDER_TIMEZONE }).format(date)} (${env.REMINDER_TIMEZONE})`;

/** Extensions are only for students who actually receive the assignment in this class. */
async function rosterStudentUserId(assignment: StaffAssignment, studentId: string): Promise<string> {
  if (assignment.recipients.length && !assignment.recipients.some((r) => r.studentId === studentId))
    throw badRequest("This student does not receive this assignment");
  const enrollment = await prisma.enrollment.findFirst({
    where: { classGroupId: assignment.classGroupId, studentId, status: "ACTIVE" },
    select: { student: { select: { userId: true } } },
  });
  if (!enrollment) throw badRequest("Choose a student enrolled in this class");
  return enrollment.student.userId;
}

export const listExtensions = (assignmentId: string) =>
  prisma.assignmentExtension.findMany({
    where: { assignmentId },
    select: { studentId: true, dueAt: true, reason: true, updatedAt: true, grantedBy: { select: { firstName: true, lastName: true } } },
    orderBy: { dueAt: "asc" },
  });

export async function grantExtension(actor: AuthUser, id: string, studentId: string, input: ExtensionInput) {
  const assignment = await getStaffAssignment(actor, id);
  if (!assignment.dueAt) throw badRequest("Set a deadline on the assignment before granting extensions");
  const dueAt = new Date(input.dueAt);
  if (dueAt <= assignment.dueAt) throw badRequest("An extension must end after the assignment deadline");
  const userId = await rosterStudentUserId(assignment, studentId);
  const key = { assignmentId_studentId: { assignmentId: id, studentId } };
  const previous = await prisma.assignmentExtension.findUnique({ where: key });
  const reason = input.reason || null;
  const result = await prisma.assignmentExtension.upsert({
    where: key,
    create: { assignmentId: id, studentId, dueAt, reason, grantedById: actor.id },
    update: { dueAt, reason, grantedById: actor.id },
  });
  await writeAudit({
    actorId: actor.id, action: previous ? "ASSIGNMENT_EXTENSION_UPDATED" : "ASSIGNMENT_EXTENSION_GRANTED", entityType: "Assignment", entityId: id,
    before: previous ? { studentId, dueAt: previous.dueAt, reason: previous.reason } : undefined, after: { studentId, dueAt, reason }, reason,
  });
  await notifyUser(userId, {
    type: "ASSIGNMENT", title: `Extension ${previous ? "updated" : "granted"}: ${assignment.title}`,
    body: `Your new deadline is ${formatDue(dueAt)}.${reason ? ` Note from your teacher: ${reason}` : ""}`, data: { assignmentId: id },
  });
  return result;
}

export async function removeExtension(actor: AuthUser, id: string, studentId: string): Promise<void> {
  const assignment = await getStaffAssignment(actor, id);
  const key = { assignmentId_studentId: { assignmentId: id, studentId } };
  const previous = await prisma.assignmentExtension.findUnique({ where: key, include: { student: { select: { userId: true } } } });
  if (!previous) throw notFound("Extension not found");
  await prisma.assignmentExtension.delete({ where: key });
  await writeAudit({
    actorId: actor.id, action: "ASSIGNMENT_EXTENSION_REMOVED", entityType: "Assignment", entityId: id,
    before: { studentId, dueAt: previous.dueAt, reason: previous.reason },
  });
  await notifyUser(previous.student.userId, {
    type: "ASSIGNMENT", title: `Extension removed: ${assignment.title}`,
    body: assignment.dueAt ? `Your deadline is ${formatDue(assignment.dueAt)}.` : "This assignment has no deadline.", data: { assignmentId: id },
  });
}
