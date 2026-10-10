import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateAssessmentInput
} from "./assessments.schema.js";
import { saveAuthoredQuestions } from "./save-authored-questions.js";
export const updateAssessment = async (
  id: string,
  input: UpdateAssessmentInput,
  actorId?: string,
) => {
  const before = await prisma.assessment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Assessment not found");
  }

  const data: Prisma.AssessmentUncheckedUpdateInput = {
    levelId: input.levelId,
    lessonId: input.lessonId,
    prerequisiteLessonId: input.prerequisiteLessonId,
    title: input.title,
    description: input.description,
    type: input.type,
    protectedMode: input.protectedMode,
    durationMinutes: input.durationMinutes,
    maxAttempts: input.maxAttempts,
    availableFrom: input.availableFrom,
    availableUntil: input.availableUntil,
    isPublished: input.isPublished,
  };
  if (input.passMark !== undefined) {
    data.passMark = new Prisma.Decimal(input.passMark);
  }

  const assessment = await prisma.$transaction(async tx => {
    const updated = await tx.assessment.update({ where: { id }, data });
    if (input.authoredQuestions) await saveAuthoredQuestions(tx, id, updated.levelId, input.authoredQuestions, actorId);
    return updated;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_UPDATED",
    entityType: "Assessment",
    entityId: assessment.id,
    before,
    after: assessment,
  });

  return assessment;
};
