import { prisma } from "../../src/lib/prisma.js";
import { DEMO_DOMAIN } from "./accounts.js";

export const DEMO_QUIZ_TITLE = "DEMO · A1 Quiz — Begrüßungen";

/** Removes every demo record (and nothing else) so the seed can be re-run from a clean slate. */
export async function resetDemo() {
  const users = await prisma.user.findMany({ where: { email: { endsWith: `@${DEMO_DOMAIN}` } }, select: { id: true } });
  const userIds = users.map((user) => user.id);
  const students = await prisma.student.findMany({ where: { userId: { in: userIds } }, select: { id: true } });
  const studentIds = students.map((student) => student.id);
  const classes = await prisma.classGroup.findMany({ where: { code: { startsWith: "DEMO-" } }, select: { id: true } });
  const classIds = classes.map((group) => group.id);
  const quiz = await prisma.assessment.findMany({ where: { title: DEMO_QUIZ_TITLE }, select: { id: true } });

  // Interactive transaction with a long timeout: the hosted database is reached through a slow tunnel.
  await prisma.$transaction(async (tx) => {
    for (const step of [
      () => tx.assignment.deleteMany({ where: { OR: [{ classGroupId: { in: classIds } }, { createdById: { in: userIds } }] } }),
      () => tx.paymentCheckout.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.notificationDelivery.deleteMany({ where: { userId: { in: userIds } } }),
      () => tx.conversation.deleteMany({ where: { OR: [{ createdById: { in: userIds } }, { classGroupId: { in: classIds } }] } }),
      () => tx.application.deleteMany({ where: { reference: { startsWith: "DEMO-" } } }),
      () => tx.activityEvent.deleteMany({ where: { OR: [{ actorId: { in: userIds } }, { classGroupId: { in: classIds } }] } }),
      () => tx.assessment.deleteMany({ where: { id: { in: quiz.map((row) => row.id) } } }),
      () => tx.question.deleteMany({ where: { createdById: { in: userIds } } }),
      // Rows reachable through both Student and Enrollment cascades must go first, or Postgres trips over its own SET NULL.
      () => tx.payment.deleteMany({ where: { studentId: { in: studentIds }, txnType: "REFUND" } }),
      () => tx.payment.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.discount.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.charge.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.certificate.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.attempt.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.enrollment.deleteMany({ where: { studentId: { in: studentIds } } }),
      () => tx.user.deleteMany({ where: { id: { in: userIds } } }),
      () => tx.classGroup.deleteMany({ where: { id: { in: classIds } } }),
    ]) await step();
  }, { timeout: 120_000, maxWait: 30_000 });
  return { users: userIds.length, classes: classIds.length };
}
