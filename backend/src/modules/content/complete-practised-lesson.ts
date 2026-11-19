import { prisma } from "../../lib/prisma.js";

/**
 * A course v2 lesson completes itself once the student has finished every practice session in it
 * (Duolingo-style); the first completion date is kept. Returns whether the lesson is now complete.
 */
export async function completePractisedLesson(studentId: string, lessonId: string): Promise<boolean> {
  const sessions = await prisma.activity.findMany({ where: { lessonId, type: "PRACTICE", isPublished: true }, select: { id: true } });
  if (!sessions.length) return false;
  const finished = await prisma.activitySubmission.count({ where: { studentId, activityId: { in: sessions.map((session) => session.id) } } });
  if (finished < sessions.length) return false;
  const key = { studentId_lessonId: { studentId, lessonId } };
  const progress = await prisma.lessonProgress.findUnique({ where: key, select: { status: true } });
  if (progress?.status !== "COMPLETED") {
    await prisma.lessonProgress.upsert({ where: key, create: { studentId, lessonId, status: "COMPLETED", completedAt: new Date() }, update: { status: "COMPLETED", completedAt: new Date() } });
  }
  return true;
}
