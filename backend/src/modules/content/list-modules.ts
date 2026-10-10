import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const listModules = async (levelId: string) => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw notFound("Level not found");
  }
  return prisma.module.findMany({
    where: { levelId },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          contentType: true,
          isPublished: true,
          estimatedMinutes: true,
        },
      },
    },
  });
};
