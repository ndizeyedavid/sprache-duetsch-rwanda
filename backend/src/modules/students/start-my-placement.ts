import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { toPlacementSession } from "./placement-session.js";
import { findPlacementTest,loadPlacementStudent } from "./placement-test.js";

/**
 * Starts (or resumes) the student's placement attempt. Deliberately skips the
 * enrolment and payment gates of normal assessments: placement happens before both.
 */
export const startMyPlacement = async (userId: string) => transact(async (tx) => {
  const student = await loadPlacementStudent(userId, tx);
  const test = await findPlacementTest(tx);
  if (!test) throw notFound("The placement test is not available yet");

  const attemptSelect = { id: true, startedAt: true, questionSnapshot: true, draftResponses: true } as const;
  const existing = await tx.attempt.findFirst({
    where: { assessmentId: test.id, studentId: student.id, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    select: attemptSelect,
  });
  if (existing) return toPlacementSession(existing, test);

  const used = await tx.attempt.count({ where: { assessmentId: test.id, studentId: student.id } });
  if (used >= test.maxAttempts) {
    throw forbidden("You have used all placement test attempts. Ask the academic office if you need a retake.");
  }

  const rows = await tx.assessmentQuestion.findMany({
    where: { assessmentId: test.id },
    orderBy: { order: "asc" },
    include: { question: true },
  });
  if (rows.length === 0) throw notFound("The placement test has no questions yet");

  const maxScore = rows.reduce((sum, row) => sum + Number(row.points ?? row.question.points), 0);
  const snapshot = { questions: rows, durationMinutes: test.durationMinutes, passMark: test.passMark };
  const attempt = await tx.attempt.create({
    data: {
      assessmentId: test.id,
      studentId: student.id,
      attemptNumber: used + 1,
      status: "IN_PROGRESS",
      maxScore: new Prisma.Decimal(maxScore),
      questionSnapshot: JSON.parse(JSON.stringify(snapshot)) as Prisma.InputJsonValue,
    },
    select: attemptSelect,
  });

  await writeAuditTx(tx, {
    actorId: userId,
    action: "PLACEMENT_TEST_STARTED",
    entityType: "Attempt",
    entityId: attempt.id,
    after: { assessmentId: test.id, studentId: student.id, attemptNumber: used + 1 },
  });

  return toPlacementSession(attempt, test);
});
