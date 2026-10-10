import { assertLevelAccess,assertPaymentAccess,loadStudentAccessProfile } from "../../lib/access.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";

export async function assertLessonAvailable(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, include: { module: true } });
  const now = new Date();
  if (!lesson || !lesson.isPublished || !lesson.module.isPublished ||
    (lesson.releaseAt && lesson.releaseAt > now) || (lesson.module.releaseAt && lesson.module.releaseAt > now)) throw notFound("Lesson is not available");
  await assertLevelAccess(userId, lesson.module.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "LESSON");
  if (lesson.prerequisiteLessonId && !await prisma.lessonProgress.findFirst({ where: {
    studentId: profile.studentId, lessonId: lesson.prerequisiteLessonId, status: "COMPLETED",
  } })) throw forbidden("Complete the prerequisite lesson first");
  if (lesson.module.prerequisiteModuleId) {
    const required = await prisma.lesson.findMany({ where: { moduleId: lesson.module.prerequisiteModuleId, isPublished: true }, select: { id: true } });
    const completed = await prisma.lessonProgress.count({ where: { studentId: profile.studentId, status: "COMPLETED", lessonId: { in: required.map(row => row.id) } } });
    if (!required.length || completed < required.length) throw forbidden("Complete the prerequisite module first");
  }
  return { lesson, profile };
}

export async function getAvailableLessonIds(userId: string) {
  const profile = await loadStudentAccessProfile(userId);
  const rows = await prisma.lesson.findMany({ where: { isPublished: true, module: { isPublished: true, levelId: { in: profile.levelIds } } },
    include: { module: true, progress: { where: { studentId: profile.studentId }, select: { status: true } } } });
  const completed = new Set(rows.filter(row => row.progress.some(p => p.status === "COMPLETED")).map(row => row.id));
  const now = new Date();
  return rows.filter(row => (!row.releaseAt || row.releaseAt <= now) && (!row.module.releaseAt || row.module.releaseAt <= now) &&
    (!row.prerequisiteLessonId || completed.has(row.prerequisiteLessonId)) &&
    (!row.module.prerequisiteModuleId || rows.some(r => r.moduleId === row.module.prerequisiteModuleId) &&
      rows.filter(r => r.moduleId === row.module.prerequisiteModuleId).every(r => completed.has(r.id))))
    .map(row => row.id);
}
