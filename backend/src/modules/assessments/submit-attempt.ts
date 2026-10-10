import { writeActivityTx } from "../activity/activity-transaction.js";
import { Prisma } from "../../generated/prisma/client.js";
import {
assertLevelAccess,
assertPaymentAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import type {
SubmitAttemptInput
} from "./assessments.schema.js";
import { readAttemptPolicy,readSnapshot } from "./attempt-snapshot.js";
import { gradeObjectiveAnswer } from './grade-objective-answer.js';
import { isObjectiveQuestionType } from './is-objective-question-type.js';
import { jsonInput } from './json-input.js';
export const submitAttempt = async (
  userId: string,
  attemptId: string,
  input: SubmitAttemptInput,
) => transact(async tx => {
  const profile = await loadStudentAccessProfile(userId);

  const attempt = await tx.attempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        select: {
          id: true,
          levelId: true,
          passMark: true,
          durationMinutes: true,
          protectedMode: true,
          questions: {
            select: {
              points: true,
              question: { select: { id: true, type: true, points: true, correctAnswer: true } },
            },
          },
        },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.studentId) {
    throw notFound("Attempt not found");
  }

  await assertLevelAccess(userId, attempt.assessment.levelId);
  assertPaymentAccess(profile, "ASSESSMENT");

  if (attempt.status !== "IN_PROGRESS") {
    throw conflict("This attempt has already been submitted");
  }

  const questions = readSnapshot(attempt.questionSnapshot) ?? attempt.assessment.questions;
  const questionMeta = new Map(
    questions.map((row) => [
      row.question.id,
      {
        type: row.question.type,
        correctAnswer: row.question.correctAnswer,
        points: Number(row.points ?? row.question.points),
      },
    ]),
  );

  const policy = readAttemptPolicy(attempt.questionSnapshot, attempt.assessment);
  const expired = policy.durationMinutes != null && Date.now() > attempt.startedAt.getTime() + policy.durationMinutes * 60000 + 10000;
  const stored = (attempt.draftResponses ?? {}) as Record<string, unknown>;
  const answers = expired ? Object.entries(stored).map(([questionId, response]) => ({ questionId, response })) : input.answers;
  if (new Set(answers.map(a => a.questionId)).size !== answers.length) throw badRequest("Duplicate answers are not allowed");
  let score = 0;

  const operations = answers
    .filter((answer) => questionMeta.has(answer.questionId))
    .map((answer) => {
      const meta = questionMeta.get(answer.questionId);
      if (!meta) {
        return null;
      }

      let isCorrect: boolean | null = null;
      let pointsAwarded = 0;
      if (isObjectiveQuestionType(meta.type)) {
        isCorrect = gradeObjectiveAnswer(meta.type, answer.response, meta.correctAnswer);
        pointsAwarded = isCorrect ? meta.points : 0;
      }
      score += pointsAwarded;

      const response = jsonInput(answer.response);
      return tx.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: answer.questionId } },
        create: {
          attemptId,
          questionId: answer.questionId,
          response,
          isCorrect,
          pointsAwarded: new Prisma.Decimal(pointsAwarded),
        },
        update: {
          response,
          isCorrect,
          pointsAwarded: new Prisma.Decimal(pointsAwarded),
        },
      });
    })
    .filter((operation): operation is NonNullable<typeof operation> => operation !== null);

  if (answers.some(answer => !questionMeta.has(answer.questionId))) throw badRequest("Unknown answer question");
  if (operations.length > 0) {
    for (const operation of operations) await operation;
  }

  const hasSubjective = questions.some(
    (row) => !isObjectiveQuestionType(row.question.type),
  );

  const maxScore = Number(attempt.maxScore);
  const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const now = new Date();


  const flagged = attempt.cheatFlagged || !!input.requestReview && attempt.assessment.protectedMode;
  if (hasSubjective || flagged) {
    const updated = await tx.attempt.update({
      where: { id: attemptId },
      data: {
        status: "SUBMITTED",
        cheatFlagged: flagged,
        submittedAt: now,
        score: new Prisma.Decimal(score),
      },
    });

    await writeAuditTx(tx, {
      actorId: userId,
      action: "ATTEMPT_SUBMITTED",
      entityType: "Attempt",
      entityId: attemptId,
      after: updated,
    });


    await writeActivityTx(tx, { actorId: userId, type: "EXAM", title: "Exam submitted", body: "Awaiting manual grading.", studentId: attempt.studentId });
    return { status: "SUBMITTED", message: "Awaiting manual grading" };
  }

  const passed = percentage >= policy.passMark;
  const updated = await tx.attempt.update({
    where: { id: attemptId },
    data: {
      status: "GRADED",
      submittedAt: now,
      gradedAt: now,
      score: new Prisma.Decimal(score),
      passed,
    },
  });

  await writeAuditTx(tx, {
    actorId: userId,
    action: "ATTEMPT_SUBMITTED",
    entityType: "Attempt",
    entityId: attemptId,
    after: updated,
  });


  await writeActivityTx(tx, { actorId: userId, type: "EXAM", title: "Exam auto-graded", body: `Score ${score}/${maxScore}.`, studentId: attempt.studentId });
  return {
    status: "GRADED",
    score,
    maxScore,
    percentage,
    passed,
    feedback: updated.feedback,
  };
});
