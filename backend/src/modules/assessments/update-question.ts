import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateQuestionInput
} from "./assessments.schema.js";
import { jsonInput } from './json-input.js';
export const updateQuestion = async (id: string, input: UpdateQuestionInput, actorId?: string) => {
  const before = await prisma.question.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Question not found");
  }

  const data: Prisma.QuestionUncheckedUpdateInput = {
    levelId: input.levelId,
    moduleId: input.moduleId,
    type: input.type,
    skill: input.skill,
    difficulty: input.difficulty,
    prompt: input.prompt,
    explanation: input.explanation,
    imageUrl: input.imageUrl,
    audioUrl: input.audioUrl,
    options: jsonInput(input.options),
    correctAnswer: jsonInput(input.correctAnswer),
  };
  if (input.points !== undefined) {
    data.points = new Prisma.Decimal(input.points);
  }

  const question = await prisma.question.update({ where: { id }, data });

  await writeAudit({
    actorId: actorId ?? null,
    action: "QUESTION_UPDATED",
    entityType: "Question",
    entityId: question.id,
    before,
    after: question,
  });

  return question;
};
