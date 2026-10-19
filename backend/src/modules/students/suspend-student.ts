import { writeAudit } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";

async function loadStudent(id: string) {
  const student = await prisma.student.findUnique({ where: { id }, include: { user: { select: { id: true, status: true, firstName: true } } } });
  if (!student) throw notFound("Student not found");
  return student;
}

/**
 * Ban: the student can still sign in, but only sees a "suspended" screen with this reason
 * (see requireAuth). Status lives on both User and Student, so both change together.
 */
export async function suspendStudent(id: string, reason: string, actorId: string) {
  const student = await loadStudent(id);
  if (student.user.status === "WITHDRAWN") throw badRequest("Withdrawn students cannot be suspended");
  const now = new Date();
  await prisma.$transaction([
    prisma.user.update({ where: { id: student.userId }, data: { status: "SUSPENDED", suspendedReason: reason, suspendedAt: now, suspendedById: actorId } }),
    prisma.student.update({ where: { id }, data: { status: "SUSPENDED" } }),
  ]);
  await writeAudit({ actorId, action: "STUDENT_SUSPENDED", entityType: "Student", entityId: id, before: { status: student.user.status }, after: { status: "SUSPENDED" }, reason });
  await notifyUser(student.userId, {
    type: "SYSTEM", title: "Your account has been suspended",
    body: `Your Deutsch Sprache RW account has been suspended.\n\nReason: ${reason}\n\nPlease contact the school office if you have questions.`,
    data: { kind: "ACCOUNT_SUSPENDED" },
  });
  return { id, status: "SUSPENDED", suspendedReason: reason, suspendedAt: now };
}

/** Lifts the ban: the account is active again and the reason is cleared. */
export async function reinstateStudent(id: string, actorId: string) {
  const student = await loadStudent(id);
  if (student.user.status !== "SUSPENDED") throw badRequest("This student is not suspended");
  await prisma.$transaction([
    prisma.user.update({ where: { id: student.userId }, data: { status: "ACTIVE", suspendedReason: null, suspendedAt: null, suspendedById: null } }),
    prisma.student.update({ where: { id }, data: { status: "ACTIVE" } }),
  ]);
  await writeAudit({ actorId, action: "STUDENT_REINSTATED", entityType: "Student", entityId: id, before: { status: "SUSPENDED" }, after: { status: "ACTIVE" } });
  await notifyUser(student.userId, {
    type: "SYSTEM", title: "Your account is active again",
    body: "Your suspension has been lifted. Welcome back — you can continue learning.",
    data: { kind: "ACCOUNT_REINSTATED" },
  });
  return { id, status: "ACTIVE" };
}
