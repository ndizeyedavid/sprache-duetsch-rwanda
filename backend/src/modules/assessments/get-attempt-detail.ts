import type { Prisma } from "../../generated/prisma/client.js";
import { readSnapshot, readAttemptPolicy } from "./attempt-snapshot.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getAttemptDetail = async (attemptId: string) => {
  const attempt = (await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      questionSnapshot: true,
      cheatFlagged: true, cheatCount: true, cheatLog: true,
      status: true,
      attemptNumber: true,
      score: true,
      maxScore: true,
      passed: true,
      feedback: true,
      startedAt: true,
      submittedAt: true,
      gradedAt: true,
      student: {
        select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } },
      },
      assessment: { select: { id: true, title: true, type: true, levelId: true, passMark: true } },
      answers: {
        include: {
          question: { select: { id: true, prompt: true, type: true, points: true } },
        },
      },
    } as never,
  }) as unknown as {
    id: string;
    questionSnapshot: Prisma.JsonValue | null;
    status: string;
    attemptNumber: number;
    score: unknown;
    maxScore: unknown;
    passed: boolean | null;
    feedback: string | null;
    startedAt: Date;
    submittedAt: Date | null;
    gradedAt: Date | null;
    student: { id: string; studentCode: string; user: { firstName: string; lastName: string } };
    assessment: { id: string; title: string; type: string; levelId: string; passMark: unknown };
    answers: { id: string; questionId: string; prompt: string; type: string; points: unknown; response: unknown; isCorrect: boolean | null; pointsAwarded: unknown; feedback: string | null; question: { id: string; prompt: string; type: string; points: unknown } }[];
  } | null);
  if (!attempt) {
    throw notFound("Attempt not found");
  }

  const snapshot = readSnapshot(attempt.questionSnapshot);
  const frozen = new Map(snapshot?.map(row => [row.question.id, row]));
  // cheat columns may not exist pre-migration — use safe fallback
  const rawAttempt = attempt as unknown as { cheatFlagged?: boolean; cheatCount?: number; cheatLog?: unknown };
  return {
    id: attempt.id,
    status: attempt.status,
    attemptNumber: attempt.attemptNumber,
    score: attempt.score === null ? null : Number(attempt.score),
    maxScore: Number(attempt.maxScore),
    passed: attempt.passed,
    feedback: attempt.feedback,
    cheatFlagged: rawAttempt.cheatFlagged ?? false,
    cheatCount: rawAttempt.cheatCount ?? 0,
    cheatLog: rawAttempt.cheatLog ?? [],
    startedAt: attempt.startedAt,
    submittedAt: attempt.submittedAt,
    gradedAt: attempt.gradedAt,
    student: {
      id: attempt.student.id,
      studentCode: attempt.student.studentCode,
      name: `${attempt.student.user.firstName} ${attempt.student.user.lastName}`.trim(),
    },
    assessment: { ...attempt.assessment, passMark: readAttemptPolicy(attempt.questionSnapshot, attempt.assessment).passMark },
    answers: attempt.answers.map((answer) => ({
      id: answer.id,
      questionId: answer.questionId,
      prompt: frozen.get(answer.questionId)?.question.prompt ?? answer.question.prompt,
      type: frozen.get(answer.questionId)?.question.type ?? answer.question.type,
      maxPoints: Number(frozen.get(answer.questionId)?.points ?? frozen.get(answer.questionId)?.question.points ?? answer.question.points),
      response: answer.response,
      isCorrect: answer.isCorrect,
      pointsAwarded: Number(answer.pointsAwarded),
      feedback: answer.feedback,
    })),
  };
};
