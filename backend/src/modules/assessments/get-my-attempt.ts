import { readSnapshot } from "./attempt-snapshot.js";
import {
assertAccountActive,
loadStudentAccessProfile
} from "../../lib/access.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getMyAttempt = async (userId: string, attemptId: string) => {
  const profile = await loadStudentAccessProfile(userId);

  const attempt = await prisma.attempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: { select: { id: true, title: true, levelId: true } },
      answers: {
        include: { question: { select: { id: true, prompt: true, type: true } } },
      },
    },
  });

  if (!attempt || attempt.studentId !== profile.studentId) {
    throw notFound("Attempt not found");
  }

  assertAccountActive(profile);

  const frozen = new Map(readSnapshot(attempt.questionSnapshot)?.map(row => [row.question.id, row.question]));
  const isGraded = attempt.status === "GRADED";
  const maxScore = Number(attempt.maxScore);
  const score = attempt.score === null ? null : Number(attempt.score);

  return {
    id: attempt.id,
    assessment: { id: attempt.assessment.id, title: attempt.assessment.title },
    attemptNumber: attempt.attemptNumber,
    status: attempt.status,
    score,
    maxScore,
    percentage: score === null || maxScore === 0 ? null : (score / maxScore) * 100,
    passed: attempt.passed,
    feedback: attempt.feedback,
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    gradedAt: attempt.gradedAt,
    answers: attempt.answers.map((answer) => ({
      questionId: answer.questionId,
      prompt: frozen.get(answer.questionId)?.prompt ?? answer.question.prompt,
      response: answer.response,
      ...(isGraded
        ? { isCorrect: answer.isCorrect, pointsAwarded: Number(answer.pointsAwarded) }
        : {}),
    })),
  };
};
