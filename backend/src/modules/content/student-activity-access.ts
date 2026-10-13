import { assertAccountActive,loadStudentAccessProfile } from "../../lib/access.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertLessonAvailable } from "./lesson-availability.js";

/**
 * Load a published activity the student may work on right now. Lesson
 * availability covers level access, payment access, release dates and
 * lesson/module prerequisites.
 */
export async function loadStudentActivity(userId: string, activityId: string) {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { lesson: { select: { id: true, isPublished: true, module: { select: { levelId: true } } } } },
  });
  if (!activity || !activity.isPublished || !activity.lesson.isPublished) throw notFound("Activity not found");
  await assertLessonAvailable(userId, activity.lesson.id);
  return { profile, activity };
}
