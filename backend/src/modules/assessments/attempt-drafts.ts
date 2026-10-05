import { z } from "zod";
import type { Request, Response } from "express";
import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { assertLevelAccess, loadStudentAccessProfile } from "../../lib/access.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { validatedBody, validatedParams } from "../../lib/request.js";
export const attemptDraftBody = z.object({
  responses: z
    .record(z.string(), z.unknown())
    .refine((v) => JSON.stringify(v).length <= 100000, "Draft is too large"),
});
export const saveAttemptDraft = async (req: Request, res: Response): Promise<void> => {
  const { id } = validatedParams<{ id: string }>(req);
  const profile = await loadStudentAccessProfile(req.user!.id);
  const attempt = await prisma.attempt.findUnique({
    where: { id },
    include: {
      assessment: {
        select: {
          levelId: true,
          durationMinutes: true,
          questions: { select: { questionId: true } },
        },
      },
    },
  });
  if (!attempt || attempt.studentId !== profile.studentId) throw notFound("Attempt not found");
  await assertLevelAccess(req.user!.id, attempt.assessment.levelId);
  if (attempt.status !== "IN_PROGRESS") throw conflict("This attempt has already been submitted");
  if (
    attempt.assessment.durationMinutes &&
    Date.now() > attempt.startedAt.getTime() + attempt.assessment.durationMinutes * 60000
  )
    throw badRequest("Time has expired. Submit your saved answers");
  const { responses } = validatedBody<z.infer<typeof attemptDraftBody>>(req);
  const ids = new Set(attempt.assessment.questions.map((q) => q.questionId));
  if (Object.keys(responses).some((key) => !ids.has(key)))
    throw badRequest("Unknown question in draft");
  const result = await prisma.attempt.updateMany({
    where: { id, status: "IN_PROGRESS" },
    data: { draftResponses: responses as Prisma.InputJsonValue, draftUpdatedAt: new Date() },
  });
  if (!result.count) throw conflict("This attempt has already been submitted");
  res.json({ success: true, data: { saved: true } });
};
