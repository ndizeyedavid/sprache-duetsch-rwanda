import type { Prisma } from "../../generated/prisma/client.js";
import { conflict,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { readAttemptPolicy } from "../assessments/attempt-snapshot.js";
import { attemptDeadline } from "./placement-test.js";

type Client = Prisma.TransactionClient | typeof prisma;

/** Grace period for network latency on the final, timer-triggered submit. */
export const SUBMIT_GRACE_MS = 10000;

/** Loads an open placement attempt owned by the student, or fails with 404/409. */
export const loadOpenPlacementAttempt = async (studentId: string, attemptId: string, client: Client = prisma) => {
  const attempt = await client.attempt.findUnique({
    where: { id: attemptId },
    select: {
      id: true,
      studentId: true,
      status: true,
      startedAt: true,
      questionSnapshot: true,
      draftResponses: true,
      assessment: {
        select: {
          type: true,
          durationMinutes: true,
          passMark: true,
          questions: {
            select: { points: true, question: { select: { id: true, type: true, points: true, correctAnswer: true } } },
          },
        },
      },
    },
  });
  if (!attempt || attempt.studentId !== studentId || attempt.assessment.type !== "PLACEMENT") {
    throw notFound("Placement attempt not found");
  }
  if (attempt.status !== "IN_PROGRESS") throw conflict("This placement test has already been submitted");
  const policy = readAttemptPolicy(attempt.questionSnapshot, attempt.assessment);
  const deadline = attemptDeadline(attempt.startedAt, policy.durationMinutes);
  return { attempt, policy, deadline };
};
