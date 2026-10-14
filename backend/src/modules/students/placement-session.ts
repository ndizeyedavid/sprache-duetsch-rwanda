import type { Prisma } from "../../generated/prisma/client.js";
import { readAttemptPolicy,readSnapshot } from "../assessments/attempt-snapshot.js";
import { attemptDeadline } from "./placement-test.js";

/**
 * What the student needs to sit the test. Questions are whitelisted field by field
 * so answer keys and explanations stored in the snapshot can never leak.
 */
export const toPlacementSession = (
  attempt: { id: string; startedAt: Date; questionSnapshot: Prisma.JsonValue | null; draftResponses: Prisma.JsonValue },
  test: { title: string; description: string | null; durationMinutes: number | null; passMark: unknown },
) => {
  const policy = readAttemptPolicy(attempt.questionSnapshot, test);
  const rows = readSnapshot(attempt.questionSnapshot) ?? [];
  return {
    attemptId: attempt.id,
    title: test.title,
    description: test.description,
    startedAt: attempt.startedAt,
    durationMinutes: policy.durationMinutes ?? null,
    expiresAt: attemptDeadline(attempt.startedAt, policy.durationMinutes),
    responses: (attempt.draftResponses ?? {}) as Record<string, unknown>,
    questions: rows.map((row) => ({
      id: row.id,
      order: row.order,
      points: row.points,
      question: {
        id: row.question.id,
        type: row.question.type,
        skill: row.question.skill,
        difficulty: row.question.difficulty,
        prompt: row.question.prompt,
        options: row.question.options,
        imageUrl: row.question.imageUrl,
        audioUrl: row.question.audioUrl,
        points: row.question.points,
      },
    })),
  };
};
