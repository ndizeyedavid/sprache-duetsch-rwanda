import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { lessonCovers } from "./lesson-covers.js";
export const listModules = async (levelId: string) => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw notFound("Level not found");
  }
  const [modules, covers] = await Promise.all([prisma.module.findMany({
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
          _count: { select: { activities: true } },
        },
      },
    },
  }), lessonCovers(levelId)]);
  // `coverUrl` lets the course studio show each module with its lessons' photos.
  return modules.map((module) => ({
    ...module,
    lessons: module.lessons.map((lesson) => ({ ...lesson, coverUrl: covers.get(lesson.id) ?? null })),
  }));
};
