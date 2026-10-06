import { writeAudit } from "../../lib/audit.js";
import { conflict,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const deleteQuestion = async (id: string, actorId?: string) => {
  if (await prisma.attempt.count({ where: { OR: [
    { questionSnapshot: { path: ["questions"], array_contains: [{ question: { id } }] } },
    { questionSnapshot: { array_contains: [{ question: { id } }] } },
  ] } })) throw conflict("Questions used by attempts are retained for grading history");
  const before = await prisma.question.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Question not found");
  }

  await prisma.question.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "QUESTION_DELETED",
    entityType: "Question",
    entityId: id,
    before,
  });

  return { id };
};
