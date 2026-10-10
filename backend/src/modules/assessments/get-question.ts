import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getQuestion = async (id: string) => {
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    throw notFound("Question not found");
  }
  return question;
};
