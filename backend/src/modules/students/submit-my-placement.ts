import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,conflict } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { readSnapshot } from "../assessments/attempt-snapshot.js";
import { jsonInput } from "../assessments/json-input.js";
import { loadOpenPlacementAttempt,SUBMIT_GRACE_MS } from "./load-placement-attempt.js";
import { notifyPlacementAdmins } from "./notify-placement-admins.js";
import { scorePlacement } from "./placement-scoring.js";
import { loadPlacementStudent } from "./placement-test.js";
import { placementResultSelect,toStudentPlacement } from "./placement-view.js";
import { recommendLevelByScore } from "./recommend-level-by-score.js";

export interface SubmitPlacementInput {
  answers: { questionId: string; response?: unknown }[];
}

/**
 * Auto-grades the attempt and records a TEST placement result. The student's own
 * level choice (intendedLevelId) is copied to chosenLevelId and never overwritten.
 */
export const submitMyPlacement = async (userId: string, attemptId: string, input: SubmitPlacementInput) => {
  const outcome = await transact(async (tx) => {
    const student = await loadPlacementStudent(userId, tx);
    const { attempt, policy, deadline } = await loadOpenPlacementAttempt(student.id, attemptId, tx);
    const rows = readSnapshot(attempt.questionSnapshot) ?? attempt.assessment.questions;
    const questions = rows.map((row) => ({
      id: row.question.id,
      type: row.question.type,
      correctAnswer: row.question.correctAnswer,
      points: Number(row.points ?? row.question.points),
    }));

    const known = new Set(questions.map((question) => question.id));
    if (input.answers.some((answer) => !known.has(answer.questionId))) throw badRequest("Unknown question in answers");
    if (new Set(input.answers.map((answer) => answer.questionId)).size !== input.answers.length) {
      throw badRequest("Duplicate answers are not allowed");
    }
    // After the deadline only the autosaved answers count.
    const expired = deadline !== null && Date.now() > deadline.getTime() + SUBMIT_GRACE_MS;
    const stored = (attempt.draftResponses ?? {}) as Record<string, unknown>;
    const submitted = Object.fromEntries(input.answers.map((answer) => [answer.questionId, answer.response ?? null]));
    const responses = expired ? stored : { ...stored, ...submitted };
    const graded = scorePlacement(questions, responses);

    for (const answer of graded.answers) {
      const response = jsonInput(answer.response);
      const data = { response, isCorrect: answer.isCorrect, pointsAwarded: new Prisma.Decimal(answer.pointsAwarded) };
      await tx.answer.upsert({
        where: { attemptId_questionId: { attemptId, questionId: answer.questionId } },
        create: { attemptId, questionId: answer.questionId, ...data },
        update: data,
      });
    }

    const now = new Date();
    const claimed = await tx.attempt.updateMany({
      where: { id: attemptId, status: "IN_PROGRESS" },
      data: {
        status: "GRADED",
        submittedAt: now,
        gradedAt: now,
        score: new Prisma.Decimal(graded.score),
        maxScore: new Prisma.Decimal(graded.maxScore),
        passed: graded.percentage >= policy.passMark,
      },
    });
    if (!claimed.count) throw conflict("This placement test has already been submitted");

    const recommended = await recommendLevelByScore(graded.percentage, tx);
    const result = await tx.placementResult.create({
      data: {
        studentId: student.id,
        source: "TEST",
        attemptId,
        score: graded.percentage,
        recommendedLevelId: recommended.id,
        chosenLevelId: student.intendedLevelId,
      },
      select: placementResultSelect,
    });
    await tx.student.update({ where: { id: student.id }, data: { placementScore: graded.percentage } });
    await writeAuditTx(tx, {
      actorId: userId,
      action: "PLACEMENT_TEST_SUBMITTED",
      entityType: "PlacementResult",
      entityId: result.id,
      after: { attemptId, score: graded.percentage, recommendedLevelId: recommended.id, chosenLevelId: student.intendedLevelId },
    });

    const studentName = `${student.user.firstName} ${student.user.lastName}`.trim();
    return { result, graded, studentName, recommendedCode: recommended.code };
  });

  await notifyPlacementAdmins({
    resultId: outcome.result.id,
    studentId: outcome.result.studentId,
    studentName: outcome.studentName,
    score: outcome.graded.percentage,
    recommendedCode: outcome.recommendedCode,
  });

  return {
    ...toStudentPlacement(outcome.result),
    correct: outcome.graded.score,
    total: outcome.graded.maxScore,
  };
};
