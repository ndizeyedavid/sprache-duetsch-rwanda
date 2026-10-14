import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest,conflict } from "../../lib/http-error.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { getStudentAssignment } from "./assignment-access.js";
import { checkEditable,checkResponse } from "./assignment-policy.js";
import { assignmentQuestions,suggestedScores,validateQuestionWork } from "./assignment-questions.js";
import type { DraftInput } from "./assignments.schema.js";
import { computeLateness } from "./late-penalty.js";
export const saveWork = async (userId: string, id: string, input: DraftInput, submit = false) => {
  const { assignment, profile } = await getStudentAssignment(userId, id);
  const files = await prisma.assignmentFile.findMany({ where: { id: { in: input.fileIds }, assignmentId: id, uploaderId: userId } });
  if (files.length !== new Set(input.fileIds).size) throw badRequest("An attachment does not belong to this assignment");
  if (assignment.responseType === "TEXT" && files.length) throw badRequest("This assignment accepts text only");
  if (assignment.responseType === "AUDIO" && files.some(f => !f.mimeType.startsWith("audio/"))) throw badRequest("Use audio files for this assignment");
  const questions = assignmentQuestions(assignment.questions);
  validateQuestionWork(questions, input.responses, submit);
  if (questions.length && files.length) throw badRequest("Question-based assignments do not accept attachments");
  if (submit && !questions.length) checkResponse(assignment.responseType, input.text, files);
  const saved = await prisma.$transaction(async tx => {
    const key = { assignmentId: id, studentId: profile.studentId };
    const old = await tx.assignmentSubmission.findUnique({ where: { assignmentId_studentId: key } });
    checkEditable(assignment, old);
    if (old && (!input.version || old.updatedAt.toISOString() !== input.version)) throw conflict("Your draft changed in another tab. Reload before saving");
    const now = new Date();
    const changes = { text: input.text, responses: input.responses as Prisma.InputJsonValue, fileIds: [...new Set(input.fileIds)], status: submit ? "SUBMITTED" as const : old?.status === "RETURNED" ? "RETURNED" as const : "DRAFT" as const,
      ...(submit ? { revision: (old?.revision ?? 0) + 1, submittedAt: now, score: null, rawScore: null, latePenaltyPercent: null, feedback: null, feedbackAudioFileId: null, rubricScores: Prisma.DbNull, questionScores: suggestedScores(questions, input.responses), gradedAt: null } : {}) };
    let result;
    if (old) {
      const updated = await tx.assignmentSubmission.updateMany({ where: { id: old.id, updatedAt: old.updatedAt }, data: changes });
      if (!updated.count) throw conflict("Your draft changed. Reload before saving");
      result = await tx.assignmentSubmission.findUniqueOrThrow({ where: { id: old.id } });
    } else result = await tx.assignmentSubmission.create({ data: { ...key, ...changes } });
    // assignment.dueAt is already the student's effective deadline (extension-aware).
    const lateness = computeLateness({ submittedAt: now, dueAt: assignment.dueAt, policy: assignment });
    if (submit) await tx.assignmentVersion.create({ data: { submissionId: result.id, revision: result.revision, text: input.text, responses: input.responses, questionScores: suggestedScores(questions, input.responses), fileIds: result.fileIds, submittedAt: now, isLate: lateness.isLate, lateByMinutes: lateness.lateByMinutes } });
    return result;
  });
  if (submit) {
    await writeAudit({ actorId: userId, action: "HOMEWORK_SUBMITTED", entityType: "AssignmentSubmission", entityId: saved.id });
    await notifyUser(assignment.classGroup.teacherId ?? assignment.createdById, { type: "ASSIGNMENT", title: `Work submitted: ${assignment.title}`, body: `Revision ${saved.revision} is ready to review.`, data: { assignmentId: id } });
  }
  return saved;
};
