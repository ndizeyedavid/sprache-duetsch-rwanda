import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import type {
CreateQuestionInput
} from "./assessments.schema.js";
import { jsonInput } from './json-input.js';
export const createQuestion = async (input: CreateQuestionInput, actorId?: string) => {
  const question = await prisma.question.create({
    data: {
      levelId: input.levelId,
      moduleId: input.moduleId ?? null,
      type: input.type,
      skill: input.skill,
      difficulty: input.difficulty,
      prompt: input.prompt,
      explanation: input.explanation ?? null,
      imageUrl: input.imageUrl ?? null,
      audioUrl: input.audioUrl ?? null,
      options: jsonInput(input.options),
      correctAnswer: jsonInput(input.correctAnswer),
      points: input.points !== undefined ? new Prisma.Decimal(input.points) : undefined,
      createdById: actorId ?? null,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "QUESTION_CREATED",
    entityType: "Question",
    entityId: question.id,
    after: question,
  });

  return question;
};
