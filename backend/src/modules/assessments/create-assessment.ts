import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import type {
CreateAssessmentInput
} from "./assessments.schema.js";
import { saveAuthoredQuestions } from "./save-authored-questions.js";
export const createAssessment = async (input: CreateAssessmentInput, actorId?: string) => {
  const assessment = await prisma.$transaction(async (tx) => {
    const created = await tx.assessment.create({
      data: {
        levelId: input.levelId,
        lessonId: input.lessonId ?? null,
        prerequisiteLessonId: input.prerequisiteLessonId ?? null,
        title: input.title,
        description: input.description ?? null,
        type: input.type,
        protectedMode: input.protectedMode ?? false,
        durationMinutes: input.durationMinutes ?? null,
        maxAttempts: input.maxAttempts ?? 1,
        passMark: input.passMark !== undefined ? new Prisma.Decimal(input.passMark) : undefined,
        availableFrom: input.availableFrom ?? null,
        availableUntil: input.availableUntil ?? null,
        isPublished: input.isPublished ?? false,
      },
    });

    if (input.authoredQuestions) { await saveAuthoredQuestions(tx, created.id, created.levelId, input.authoredQuestions, actorId); }
    else if (input.questions && input.questions.length > 0) {
      await tx.assessmentQuestion.createMany({
        data: input.questions.map((question, index) => ({
          assessmentId: created.id,
          questionId: question.questionId,
          order: question.order ?? index,
          points: question.points != null ? new Prisma.Decimal(question.points) : null,
        })),
      });
    }

    return created;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_CREATED",
    entityType: "Assessment",
    entityId: assessment.id,
    after: assessment,
  });

  return assessment;
};
