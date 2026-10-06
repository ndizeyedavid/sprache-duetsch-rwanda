import {
assertAccountActive,
loadStudentAccessProfile
} from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
import { releasedFilter } from './released-filter.js';
export const getStudentCourses = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: profile.studentId, status: { in: ["ACTIVE", "COMPLETED"] } },
    select: { levelId: true },
    distinct: ["levelId"],
  });
  const levelIds = enrollments.map((enrollment) => enrollment.levelId);
  if (levelIds.length === 0) {
    return [];
  }

  const now = new Date();
  const release = releasedFilter(now);
  const levels = await prisma.level.findMany({
    where: { id: { in: levelIds } },
    orderBy: { order: "asc" },
    select: {
      id: true,
      code: true,
      title: true,
      levelLabel: true,
      summary: true,
      order: true,
      modules: {
        where: release,
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          lessons: {
            where: release,
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              contentType: true,
              estimatedMinutes: true,
              progress: {
                where: { studentId: profile.studentId },
                select: { status: true, secondsWatched: true, completedAt: true },
              },
            },
          },
        },
      },
    },
  });

  return levels.map((level) => {
    const allLessons = level.modules.flatMap((item) => item.lessons);
    const completedCount = allLessons.filter(
      (lesson) => lesson.progress[0]?.status === "COMPLETED",
    ).length;

    const modules = level.modules.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      order: item.order,
      lessons: item.lessons.map((lesson) => {
        const progress = lesson.progress[0] ?? null;
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          contentType: lesson.contentType,
          estimatedMinutes: lesson.estimatedMinutes,
          progressStatus: progress?.status ?? "NOT_STARTED",
          secondsWatched: progress?.secondsWatched ?? 0,
          completedAt: progress?.completedAt ?? null,
        };
      }),
    }));

    return {
      level: {
        id: level.id,
        code: level.code,
        title: level.title,
        levelLabel: level.levelLabel,
        summary: level.summary,
        order: level.order,
      },
      modules,
      stats: {
        totalLessons: allLessons.length,
        completedLessons: completedCount,
        completionPercentage:
          allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100),
      },
    };
  });
};
