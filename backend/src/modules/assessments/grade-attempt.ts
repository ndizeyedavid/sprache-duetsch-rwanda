import { writeActivityTx } from "../activity/activity-transaction.js";
import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import type {
GradeAttemptInput
} from "./assessments.schema.js";
import { readAttemptPolicy,readSnapshot } from "./attempt-snapshot.js";
export const gradeAttempt = async (id: string, input: GradeAttemptInput, actorId?: string) => transact(async tx => {
  const before = await tx.attempt.findUnique({
    where: { id },
    include: { assessment: { select: { passMark: true, questions: { include: { question: true } } } } },
  });
  if (!before) {
    throw notFound("Attempt not found");
  }
  if (before.status === "IN_PROGRESS") {
    throw badRequest("Attempt has not been submitted yet");
  }

  if (input.answers && input.answers.length > 0) {
    const existing = await tx.answer.findMany({
      where: { attemptId: id, id: { in: input.answers.map((answer) => answer.answerId) } },
      select: { id: true },
    });
    const known = new Set(existing.map((answer) => answer.id));
    if (known.size !== input.answers.length) throw badRequest("Unknown or duplicate answer ID");
    const rows = readSnapshot(before.questionSnapshot) ?? before.assessment.questions;
    const limits = new Map(rows.map(row => [row.question.id, Number(row.points ?? row.question.points)]));
    const answers = await tx.answer.findMany({ where: { attemptId: id } });
    for (const grade of input.answers) {
      const answer = answers.find(row => row.id === grade.answerId)!;
      if (grade.pointsAwarded > (limits.get(answer.questionId) ?? 0)) throw badRequest("Grade exceeds question points");
    }

    const operations = input.answers
      .filter((answer) => known.has(answer.answerId))
      .map((answer) =>
        tx.answer.update({
          where: { id: answer.answerId },
          data: {
            pointsAwarded: new Prisma.Decimal(answer.pointsAwarded),
            feedback: answer.feedback ?? null,
            isCorrect: answer.pointsAwarded > 0,
          },
        }),
      );

    if (operations.length > 0) {
      for (const operation of operations) await operation;
    }
  }

  const aggregate = await tx.answer.aggregate({
    where: { attemptId: id },
    _sum: { pointsAwarded: true },
  });
  const score = Number(aggregate._sum.pointsAwarded ?? 0);
  const maxScore = Number(before.maxScore);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const passed = input.passed ?? percentage >= readAttemptPolicy(before.questionSnapshot, before.assessment).passMark;

  const attempt = await tx.attempt.update({
    where: { id },
    data: {
      status: "GRADED",
      score: new Prisma.Decimal(score),
      passed,
      feedback: input.feedback ?? before.feedback,
      gradedById: actorId ?? null,
      gradedAt: new Date(),
    },
  });

  await writeAuditTx(tx, {
    actorId: actorId ?? null,
    action: "ATTEMPT_GRADED",
    entityType: "Attempt",
    entityId: attempt.id,
    before,
    after: attempt,
  });


  await writeActivityTx(tx, { actorId, type: "EXAM", title: "Assessment graded", body: `Score ${score}/${maxScore} — ${passed ? "passed" : "not passed"}.`, studentId: before.studentId });
  return attempt;
});
