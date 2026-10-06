import {
assertLevelAccess,
assertPaymentAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { sanitizeActivityConfig } from "./assignment-config.js";
import { assertLessonAvailable } from "./lesson-availability.js";
export const getStudentLesson = async (userId: string, lessonId: string) => {
  await assertLessonAvailable(userId, lessonId);
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
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
      activities: { where: { isPublished: true }, orderBy: { order: "asc" } },
    },
  });

  const now = new Date();
  if (!lesson || !lesson.isPublished || (lesson.releaseAt && lesson.releaseAt > now)) {
    throw notFound("Lesson not found");
  }

  await assertLevelAccess(userId, lesson.module.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "LESSON");

  const progress = await prisma.lessonProgress.findUnique({
    where: { studentId_lessonId: { studentId: profile.studentId, lessonId } },
    select: { status: true, secondsWatched: true, completedAt: true },
  });

  let lockedByPrerequisite = false;
  if (lesson.prerequisiteLessonId) {
    const prerequisite = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: profile.studentId,
          lessonId: lesson.prerequisiteLessonId,
        },
      },
      select: { status: true },
    });
    lockedByPrerequisite = prerequisite?.status !== "COMPLETED";
    if (lockedByPrerequisite) {
      throw forbidden("Complete the prerequisite lesson first");
    }
  }

  // My submissions for each activity (for status/marks/redo on lesson)
  const mySubmissions = await prisma.activitySubmission.findMany({
    where: { studentId: profile.studentId, activityId: { in: lesson.activities.map((a) => a.id) } },
  });
  const submissionByActivityId = new Map(mySubmissions.map((s) => [s.activityId, s]));
  const activitiesWithMy = lesson.activities.map((a) => ({
    ...a,
    config: sanitizeActivityConfig(a.config, a.type),
    mySubmission: submissionByActivityId.has(a.id) ? { ...submissionByActivityId.get(a.id)!, ...(a.config && typeof a.config === "object" && !Array.isArray(a.config) && a.config.practiceMode === true ? { practiceFeedback: a.config } : {}) } : null,
  }));

  return {
    ...lesson,
    activities: activitiesWithMy,
    progressStatus: progress?.status ?? "NOT_STARTED",
    secondsWatched: progress?.secondsWatched ?? 0,
    completedAt: progress?.completedAt ?? null,
    lockedByPrerequisite,
    mySubmissionsCount: mySubmissions.length,
  };
};
