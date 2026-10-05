import { prisma } from "../../lib/prisma.js";
import { assertAccountActive, assertLevelAccess, loadStudentAccessProfile } from "../../lib/access.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import { sanitizeActivityConfig } from "./assignment-config.js";
export const getMyAssignmentDetail = async (userId: string, rawId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  if (rawId.startsWith("ACT-")) {
    const activityId = rawId.slice(4);
    const activity = await prisma.activity.findUnique({
      where: { id: activityId },
      include: { lesson: { include: { module: { include: { level: true } } } } },
    });
    if (!activity || !activity.isPublished) throw notFound("Assignment not found");
    await assertLevelAccess(userId, activity.lesson.module.levelId);
    if (!activity.lesson.isPublished || !activity.lesson.module.isPublished || (activity.lesson.releaseAt && activity.lesson.releaseAt > new Date()) || (activity.lesson.module.releaseAt && activity.lesson.module.releaseAt > new Date())) throw forbidden("This lesson is not available yet");
    if (activity.lesson.prerequisiteLessonId) {
      const prior = await prisma.lessonProgress.findUnique({ where: { studentId_lessonId: { studentId: profile.studentId, lessonId: activity.lesson.prerequisiteLessonId } } });
      if (prior?.status !== "COMPLETED") throw forbidden("Complete the prerequisite lesson first");
    }
    const submission = await prisma.activitySubmission.findUnique({
      where: { activityId_studentId: { activityId, studentId: profile.studentId } },
      select: { id: true, status: true, score: true, feedback: true } as never,
    }) as unknown as { id: string; status: string; score: unknown; feedback: unknown } | null;
    return { source: "ACTIVITY" as const, activity: { ...activity, config: sanitizeActivityConfig(activity.config, activity.type) }, submission, lesson: activity.lesson, level: activity.lesson.module.level };
  }
  if (rawId.startsWith("ASM-")) {
    const assessmentId = rawId.slice(4);
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: { level: true, _count: { select: { questions: true } }, questions: { select: { points: true, question: { select: { points: true } } } } },
    });
    if (!assessment || !assessment.isPublished) throw notFound("Assignment not found");
    await assertLevelAccess(userId, assessment.levelId);
    // Select only stable columns — new cheat columns may not be migrated yet on dev DB
    const attempts = await prisma.attempt.findMany({
      where: { assessmentId, studentId: profile.studentId },
      orderBy: { attemptNumber: "desc" },
      select: { id: true, status: true, submittedAt: true, score: true, maxScore: true, passed: true, feedback: true },
    });
    return { source: "ASSESSMENT" as const, assessment, attempts };
  }
  throw notFound("Assignment not found");
};

