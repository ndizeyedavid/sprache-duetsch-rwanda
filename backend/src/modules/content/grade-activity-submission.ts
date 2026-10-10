import { writeAudit } from "../../lib/audit.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { emitActivity } from "../activity/activity.service.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
GradeActivitySubmissionInput
} from "./content.schema.js";
export const gradeActivitySubmission = async (actor: ContentActor, submissionId: string, input: GradeActivitySubmissionInput) => {
  const existing = await prisma.activitySubmission.findUnique({
    where: { id: submissionId },
    include: { activity: { select: { id: true, lesson: { select: { module: { select: { levelId: true } } } } } } },
  });
  if (!existing) throw notFound("Submission not found");
  await assertCanManageLevel(actor, existing.activity.lesson.module.levelId);
  if (actor.role === "TEACHER" && !await prisma.enrollment.findFirst({ where: { studentId: existing.studentId, status: "ACTIVE", levelId: existing.activity.lesson.module.levelId, classGroup: { teacherId: actor.id } } })) throw forbidden("This student is not in your assigned classes");

  const updated = await prisma.activitySubmission.update({
    where: { id: submissionId },
    data: {
      score: input.score !== undefined ? input.score : undefined,
      isCorrect: input.isCorrect,
      feedback: input.feedback,
      status: 'GRADED',
      gradedAt: new Date(),
      gradedById: actor.id ?? null,
    },
  });

  await writeAudit({ actorId: actor.id ?? null, action: "ACTIVITY_GRADED", entityType: "ActivitySubmission", entityId: submissionId, before: existing, after: updated });
  await emitActivity({ actorId: actor.id, type: 'ASSIGNMENT', title: 'Activity graded', body: updated.feedback ?? undefined, levelId: existing.activity.lesson.module.levelId, studentId: existing.studentId });

  return updated;
};
