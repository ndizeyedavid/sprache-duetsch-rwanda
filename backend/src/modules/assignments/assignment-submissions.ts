import { Prisma } from "../../generated/prisma/client.js";
import type { AuthUser } from "../../types/auth.js";
import { prisma } from "../../lib/prisma.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { writeAudit } from "../../lib/audit.js";
import { notifyUser } from "../../lib/notify.js";
import { getStaffAssignment, getStudentAssignment } from "./assignment-access.js";
import { checkEditable, checkResponse } from "./assignment-policy.js";
import type { DraftInput, ReviewInput } from "./assignments.schema.js";
export const saveWork = async (userId: string, id: string, input: DraftInput, submit = false) => {
  const { assignment, profile } = await getStudentAssignment(userId, id);
  const files = await prisma.assignmentFile.findMany({ where: { id: { in: input.fileIds }, assignmentId: id, uploaderId: userId } });
  if (files.length !== new Set(input.fileIds).size) throw badRequest("An attachment does not belong to this assignment");
  if (assignment.responseType === "TEXT" && files.length) throw badRequest("This assignment accepts text only");
  if (assignment.responseType === "AUDIO" && files.some(f => !f.mimeType.startsWith("audio/"))) throw badRequest("Use audio files for this assignment");
  if (submit) checkResponse(assignment.responseType, input.text, files);
  const saved = await prisma.$transaction(async tx => {
    const key = { assignmentId: id, studentId: profile.studentId };
    const old = await tx.assignmentSubmission.findUnique({ where: { assignmentId_studentId: key } });
    checkEditable(assignment, old);
    if (old && (!input.version || old.updatedAt.toISOString() !== input.version)) throw conflict("Your draft changed in another tab. Reload before saving");
    const now = new Date();
    const changes = { text: input.text, fileIds: [...new Set(input.fileIds)], status: submit ? "SUBMITTED" as const : old?.status === "RETURNED" ? "RETURNED" as const : "DRAFT" as const,
      ...(submit ? { revision: (old?.revision ?? 0) + 1, submittedAt: now, score: null, feedback: null, rubricScores: Prisma.DbNull, gradedAt: null } : {}) };
    let result;
    if (old) {
      const updated = await tx.assignmentSubmission.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: changes });
      if (!updated.count) throw conflict("Your draft changed. Reload before saving");
      result = await tx.assignmentSubmission.findUniqueOrThrow({ where: { id: old.id } });
    } else result = await tx.assignmentSubmission.create({ data: { ...key, ...changes } });
    if (submit) await tx.assignmentVersion.create({ data: { submissionId: result.id, revision: result.revision, text: input.text, fileIds: result.fileIds, isLate: !!assignment.dueAt && now > assignment.dueAt } });
    return result;
  });
  if (submit) {
    await writeAudit({ actorId: userId, action: "HOMEWORK_SUBMITTED", entityType: "AssignmentSubmission", entityId: saved.id });
    await notifyUser(assignment.classGroup.teacherId ?? assignment.createdById, { type: "ASSIGNMENT", title: `Work submitted: ${assignment.title}`, body: `Revision ${saved.revision} is ready to review.`, data: { assignmentId: id } });
  }
  return saved;
};
export const reviewWork = async (actor: AuthUser, id: string, submissionId: string, input: ReviewInput) => {
  const assignment = await getStaffAssignment(actor, id);
  const submission = await prisma.assignmentSubmission.findFirst({ where: { id: submissionId, assignmentId: id }, include: { student: { select: { userId: true } } } });
  if (!submission) throw notFound("Submission not found");
  if (submission.status !== "SUBMITTED") throw conflict("Only submitted work can be reviewed");
  if (input.action === "RETURN" && submission.revision >= assignment.maxSubmissions) throw conflict("Increase the submission limit before requesting a revision");
  const rubric = assignment.rubric as { points: number }[];
  let score = input.score;
  if (input.action === "GRADE" && rubric.length) {
    if (input.rubricScores.length !== rubric.length || input.rubricScores.some((s, i) => s > rubric[i].points)) throw badRequest("Score every rubric criterion within its limit");
    score = input.rubricScores.reduce((a, b) => a + b, 0);
  }
  if (input.action === "GRADE" && (score === undefined || score > Number(assignment.maxPoints))) throw badRequest("Enter a score within the assignment points");
  const gradedAt = new Date();
  const result = await prisma.$transaction(async tx => {
    const changed = await tx.assignmentSubmission.updateMany({ where: { id: submissionId, status: "SUBMITTED", revision: submission.revision }, data: { status: input.action === "GRADE" ? "GRADED" : "RETURNED", score: input.action === "GRADE" ? score : null, feedback: input.feedback, rubricScores: input.rubricScores, gradedAt } });
    if (!changed.count) throw conflict("This submission has already been reviewed");
    await tx.assignmentVersion.update({ where: { submissionId_revision: { submissionId, revision: submission.revision } }, data: { score: input.action === "GRADE" ? score : null, feedback: input.feedback, rubricScores: input.rubricScores, gradedAt, gradedById: actor.id } });
    return tx.assignmentSubmission.findUniqueOrThrow({ where: { id: submissionId } });
  });
  await writeAudit({ actorId: actor.id, action: input.action === "GRADE" ? "HOMEWORK_GRADED" : "HOMEWORK_RETURNED", entityType: "AssignmentSubmission", entityId: submissionId });
  await notifyUser(submission.student.userId, { type: "ASSIGNMENT", title: `${input.action === "GRADE" ? "Feedback ready" : "Revision requested"}: ${assignment.title}`, body: input.feedback, data: { assignmentId: id } });
  return result;
};
