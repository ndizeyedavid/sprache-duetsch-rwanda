import type { Prisma } from "../../generated/prisma/client.js";
import {
loadStudentAccessProfile
} from "../../lib/access.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getPracticeActivityIds } from "./practice.utils.js";
export const listMyActivitySubmissions = async (userId: string, lessonId?: string) => {
  const profile = await loadStudentAccessProfile(userId);
  const where: Prisma.ActivitySubmissionWhereInput = { studentId: profile.studentId };
  if (lessonId) {
    const lesson = await prisma.lesson.findUnique({ where: { id: lessonId }, select: { id: true } });
    if (!lesson) throw notFound("Lesson not found");
    where.activity = { lessonId };
  }
  return prisma.activitySubmission.findMany({ where: lessonId ? where : { ...where, activityId: { notIn: await getPracticeActivityIds() } }, orderBy: { updatedAt: 'desc' }, include: { activity: { select: { id: true, title: true, type: true, lessonId: true } } } });
};
