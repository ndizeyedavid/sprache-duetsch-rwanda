import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
ReplaceAssessmentQuestionsInput
} from "./assessments.schema.js";
import { getAssessment } from './get-assessment.js';
export const replaceAssessmentQuestions = async (
  id: string,
  input: ReplaceAssessmentQuestionsInput,
  actorId?: string,
) => {
  const before = await prisma.assessment.findUnique({
    where: { id },
    include: { questions: { orderBy: { order: "asc" } } },
  });
  if (!before) {
    throw notFound("Assessment not found");
  }

  const rows = input.questions.map((question, index) => ({
    assessmentId: id,
    questionId: question.questionId,
    order: question.order ?? index,
    points: question.points != null ? new Prisma.Decimal(question.points) : null,
  }));

  const operations: Prisma.PrismaPromise<unknown>[] = [
    prisma.assessmentQuestion.deleteMany({ where: { assessmentId: id } }),
  ];
  if (rows.length > 0) {
    operations.push(prisma.assessmentQuestion.createMany({ data: rows }));
  }
  await prisma.$transaction(operations);

  await writeAudit({
    actorId: actorId ?? null,
    action: "ASSESSMENT_QUESTIONS_REPLACED",
    entityType: "Assessment",
    entityId: id,
    before: before.questions,
    after: rows,
  });

  return getAssessment(id);
};
