import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import { emitActivity } from "../activity/activity.service.js";
import { normalizeFileResponse } from "./activity-file-response.js";
import { gradeActivity } from "./activity-grading.js";
import { asConfig } from "./activity-keys.js";
import { presentSubmission } from "./activity-review.js";
import type { SubmitActivityInput } from "./content.schema.js";
import { isPracticeConfig } from "./practice.utils.js";
import { loadStudentActivity } from "./student-activity-access.js";

export const submitActivity = async (userId: string, activityId: string, input: SubmitActivityInput) => {
  const { profile, activity } = await loadStudentActivity(userId, activityId);
  const response = await normalizeFileResponse(userId, activityId, input.response);
  const graded = gradeActivity(activity.type, response, asConfig(activity.config));
  const status = graded.auto ? 'GRADED' as const : 'SUBMITTED' as const;

  const existing = await prisma.activitySubmission.findUnique({ where: { activityId_studentId: { activityId, studentId: profile.studentId } } });

  const submission = await prisma.activitySubmission.upsert({
    where: { activityId_studentId: { activityId, studentId: profile.studentId } },
    create: {
      activityId,
      studentId: profile.studentId,
      response: response as Prisma.InputJsonValue,
      isCorrect: graded.isCorrect,
      score: graded.score !== null ? graded.score : null,
      maxScore: 1,
      status,
      attemptNumber: 1,
      submittedAt: new Date(),
      gradedAt: graded.auto ? new Date() : null,
    },
    update: {
      response: response as Prisma.InputJsonValue,
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

  if (isPracticeConfig(activity.config)) return presentSubmission(submission, activity);

  const levelId = activity.lesson.module.levelId;
  const body = !graded.auto ? 'Awaiting grading' : graded.isCorrect === null ? 'Completed' : graded.isCorrect ? 'Correct' : 'Needs review';
  await emitActivity({ actorId: userId, type: 'ASSIGNMENT', title: `Activity ${graded.auto ? 'completed' : 'submitted'}: ${activity.title}`, body, levelId, studentId: profile.studentId });

  return presentSubmission(submission, activity);
};
