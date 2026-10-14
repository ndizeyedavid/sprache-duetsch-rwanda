import type { Prisma } from "../../generated/prisma/client.js";
import { badRequest,conflict } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { readSnapshot } from "../assessments/attempt-snapshot.js";
import { loadOpenPlacementAttempt } from "./load-placement-attempt.js";
import { loadPlacementStudent } from "./placement-test.js";

/** Autosave: keeps answers server-side so a dropped connection never loses work. */
export const saveMyPlacementDraft = async (userId: string, attemptId: string, responses: Record<string, unknown>) => {
  const student = await loadPlacementStudent(userId);
  const { attempt, deadline } = await loadOpenPlacementAttempt(student.id, attemptId);
  if (deadline && Date.now() > deadline.getTime()) throw badRequest("Time is up. Submit your saved answers");

  const snapshot = readSnapshot(attempt.questionSnapshot);
  const ids = new Set(snapshot ? snapshot.map((row) => row.question.id) : attempt.assessment.questions.map((row) => row.question.id));
  if (Object.keys(responses).some((key) => !ids.has(key))) throw badRequest("Unknown question in draft");

  const saved = await prisma.attempt.updateMany({
    where: { id: attemptId, status: "IN_PROGRESS" },
    data: { draftResponses: responses as Prisma.InputJsonValue, draftUpdatedAt: new Date() },
  });
  if (!saved.count) throw conflict("This placement test has already been submitted");
  return { saved: true };
};
