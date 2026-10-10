import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const levelIdOfLesson = async (lessonId: string): Promise<string> => {
  const found = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { levelId: true } } },
  });
  if (!found) {
    throw notFound("Lesson not found");
  }
  return found.module.levelId;
};
