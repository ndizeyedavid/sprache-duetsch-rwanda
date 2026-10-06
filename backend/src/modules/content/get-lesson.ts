import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getLesson = async (id: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          levelId: true,
          level: { select: { id: true, code: true, title: true, levelLabel: true } },
        },
      },
      materials: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { order: "asc" } },
    },
  });
  if (!lesson) {
    throw notFound("Lesson not found");
  }
  return lesson;
};
