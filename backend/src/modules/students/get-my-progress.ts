import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getMyProgress = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      currentLevelId: true,
      intendedLevelId: true,
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        orderBy: { enrolledAt: "asc" },
        select: { levelId: true },
      },
    },
  });

  if (!student) {
    throw notFound("Student profile not found");
  }

  const levelIds = [...new Set(student.enrollments.map((enrollment) => enrollment.levelId))];
  if (levelIds.length === 0) {
    return { levels: [], overallPercentage: 0 };
  }

  const levels = await prisma.level.findMany({
    where: { id: { in: levelIds } },
    orderBy: { order: "asc" },
    select: {
      id: true,
      code: true,
      title: true,
      levelLabel: true,
      order: true,
      modules: {
        where: { isPublished: true, OR: [{ releaseAt: null }, { releaseAt: { lte: new Date() } }] },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            where: { isPublished: true, OR: [{ releaseAt: null }, { releaseAt: { lte: new Date() } }] },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              progress: {
                where: { studentId: student.id },
                select: { status: true, completedAt: true },
              },
            },
          },
        },
      },
    },
  });

  let totalLessons = 0;
  let completedLessons = 0;

  const levelSummaries = levels.map((level) => {
    let levelTotal = 0;
    let levelCompleted = 0;

    const modules = level.modules.map((module) => {
      const lessons = module.lessons.map((lesson) => {
        const progress = lesson.progress[0];
        const status = progress?.status ?? "NOT_STARTED";
        levelTotal += 1;
        if (status === "COMPLETED") levelCompleted += 1;
        return {
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          status,
          completedAt: progress?.completedAt ?? null,
        };
      });

      return { id: module.id, title: module.title, order: module.order, lessons };
    });

    totalLessons += levelTotal;
    completedLessons += levelCompleted;

    return {
      level: {
        id: level.id,
        code: level.code,
        title: level.title,
        levelLabel: level.levelLabel,
        order: level.order,
      },
      modules,
      completionPercentage: levelTotal > 0 ? Math.round((levelCompleted / levelTotal) * 100) : 0,
    };
  });

  return {
    levels: levelSummaries,
    overallPercentage:
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
  };
};
