import { Prisma } from '../../generated/prisma/client.js';
import type { AuthoredQuestion } from './authored-question.schema.js';
export async function saveAuthoredQuestions(tx: Prisma.TransactionClient, assessmentId: string, levelId: string, rows: AuthoredQuestion[], actorId?: string): Promise<void> {
  await tx.assessmentQuestion.deleteMany({ where: { assessmentId } });
  for (const [order, q] of rows.entries()) {
    const question = await tx.question.create({ data: { levelId, createdById: actorId, type: q.type, prompt: q.prompt, points: q.points,
      skill: q.skill, difficulty: q.difficulty, audioUrl: q.audioUrl, imageUrl: q.imageUrl,
      options: q.options ?? Prisma.JsonNull, correctAnswer: q.correctAnswer ?? Prisma.JsonNull } });
    await tx.assessmentQuestion.create({ data: { assessmentId, questionId: question.id, order } });
  }
}
