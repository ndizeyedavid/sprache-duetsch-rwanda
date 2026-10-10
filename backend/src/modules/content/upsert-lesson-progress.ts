import {
assertLevelAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
UpdateProgressInput
} from "./content.schema.js";
import { assertLessonAvailable } from "./lesson-availability.js";
export const upsertLessonProgress = async (
  userId: string,
  lessonId: string,
  input: UpdateProgressInput,
) => {
  await assertLessonAvailable(userId, lessonId);
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { prerequisiteLessonId: true, module: { select: { levelId: true } } },
  });
  if (!lesson) {
    throw notFound("Lesson not found");
  }
  await assertLevelAccess(userId, lesson.module.levelId);
  const profile = await loadStudentAccessProfile(userId);

  if (input.status === "COMPLETED" && lesson.prerequisiteLessonId) {
    const prerequisite = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: profile.studentId,
          lessonId: lesson.prerequisiteLessonId,
        },
      },
      select: { status: true },
    });
    if (prerequisite?.status !== "COMPLETED") {
      throw forbidden("Complete the prerequisite lesson first");
    }
  }

  const completedAt = input.status === "COMPLETED" ? new Date() : null;

  return prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: profile.studentId, lessonId } },
    create: {
      studentId: profile.studentId,
      lessonId,
      status: input.status,
      secondsWatched: input.secondsWatched ?? 0,
      completedAt,
    },
    update: {
      status: input.status,
      secondsWatched: input.secondsWatched,
      completedAt,
    },
  });
};
