import { prisma } from "../../lib/prisma.js";
import { activityIdFromFileName } from "./activity-file-policy.js";

/**
 * A teacher may open a student's activity upload (recording or document) when
 * that student is actively enrolled in one of the teacher's classes for the
 * activity's level — the same rule that lets them grade the submission.
 */
export async function teacherCanReviewActivityFile(teacherId: string, file: { name: string; uploaderId: string }): Promise<boolean> {
  const activityId = activityIdFromFileName(file.name);
  if (!activityId) return false;
  const [activity, student] = await Promise.all([
    prisma.activity.findUnique({ where: { id: activityId }, select: { lesson: { select: { module: { select: { levelId: true } } } } } }),
    prisma.student.findUnique({ where: { userId: file.uploaderId }, select: { id: true } }),
  ]);
  if (!activity || !student) return false;
  const enrollment = await prisma.enrollment.findFirst({
    where: { studentId: student.id, status: "ACTIVE", levelId: activity.lesson.module.levelId, classGroup: { teacherId } },
    select: { id: true },
  });
  return enrollment !== null;
}

/** Lessons whose published activities reference an upload (listening audio, card audio, model audio). */
export async function lessonsWithActivityMedia(suffix: string): Promise<{ id: string; module: { levelId: string } }[]> {
  const rows = await prisma.$queryRaw<{ lessonId: string }[]>`
    SELECT DISTINCT "lessonId" FROM "Activity" WHERE "isPublished" = true AND position(${suffix} in "config"::text) > 0`;
  if (rows.length === 0) return [];
  return prisma.lesson.findMany({ where: { id: { in: rows.map((row) => row.lessonId) } }, select: { id: true, module: { select: { levelId: true } } } });
}
