import type { Prisma } from "../../generated/prisma/client.js";
import { assertAccountActive,assertLevelAccess,assertPaymentAccess,loadStudentAccessProfile } from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { emitActivity } from "../activity/activity.service.js";
import { gradeActivity } from "./activity-grading.js";
import type { SubmitActivityInput } from "./content.schema.js";
import { assertLessonAvailable } from "./lesson-availability.js";
import { isPracticeConfig } from "./practice.utils.js";

export const submitActivity = async (userId: string, activityId: string, input: SubmitActivityInput) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  const activity = await prisma.activity.findUnique({
    where: { id: activityId },
    include: { lesson: { select: { id: true, prerequisiteLessonId: true, releaseAt: true, module: { select: { levelId: true, isPublished: true } }, isPublished: true } } },
  });
  if (!activity || !activity.isPublished || !activity.lesson.isPublished) throw notFound("Activity not found");
  await assertLessonAvailable(userId, activity.lesson.id);
  await assertLevelAccess(userId, activity.lesson.module.levelId);
  assertPaymentAccess(profile, "LESSON");

  if (!activity.lesson.module.isPublished || (activity.lesson.releaseAt && activity.lesson.releaseAt > new Date())) throw forbidden("Lesson unavailable");
  if (activity.lesson.prerequisiteLessonId) {
    const previous = await prisma.lessonProgress.findUnique({ where: { studentId_lessonId: {
      studentId: profile.studentId, lessonId: activity.lesson.prerequisiteLessonId,
    } } });
    if (previous?.status !== "COMPLETED") throw forbidden("Complete the prerequisite lesson first");
  }
  const graded = gradeActivity(activity.type, input.response, (activity.config ?? {}) as Record<string, unknown>);
  const status = graded.auto ? 'GRADED' as const : 'SUBMITTED' as const;

  const existing = await prisma.activitySubmission.findUnique({ where: { activityId_studentId: { activityId, studentId: profile.studentId } } });

  const submission = await prisma.activitySubmission.upsert({
    where: { activityId_studentId: { activityId, studentId: profile.studentId } },
    create: {
      activityId,
      studentId: profile.studentId,
      response: input.response as Prisma.InputJsonValue,
      isCorrect: graded.isCorrect,
      score: graded.score !== null ? graded.score : null,
      maxScore: 1,
      status,
      attemptNumber: 1,
      submittedAt: new Date(),
      gradedAt: graded.auto ? new Date() : null,
    },
    update: {
      response: input.response as Prisma.InputJsonValue,
      isCorrect: graded.isCorrect,
      score: graded.score !== null ? graded.score : null,
      status,
      feedback: null,
      attemptNumber: existing ? existing.attemptNumber + 1 : 1,
      submittedAt: new Date(),
      gradedAt: graded.auto ? new Date() : null,
      gradedById: null,
    },
  });

  await writeAudit({ actorId: userId, action: existing ? "ACTIVITY_RESUBMITTED" : "ACTIVITY_SUBMITTED", entityType: "ActivitySubmission", entityId: submission.id, after: submission });

  if (isPracticeConfig(activity.config)) return { ...submission, practiceFeedback: activity.config };

  if (graded.auto) {
    await emitActivity({ actorId: userId, type: 'ASSIGNMENT', title: `Activity completed: ${activity.title}`, body: graded.isCorrect ? 'Correct' : 'Needs review', levelId: activity.lesson.module.levelId, studentId: profile.studentId });
  } else {
    await emitActivity({ actorId: userId, type: 'ASSIGNMENT', title: `Activity submitted: ${activity.title}`, body: 'Awaiting grading', levelId: activity.lesson.module.levelId, studentId: profile.studentId });
  }

  return submission;
};
