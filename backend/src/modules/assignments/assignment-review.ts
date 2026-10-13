import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthUser } from "../../types/auth.js";
import { getStaffAssignment } from "./assignment-access.js";
import { assignmentQuestions, checkQuestionScores } from "./assignment-questions.js";
import type { PenaltyOverrideInput, ReviewInput } from "./assignments.schema.js";
import { applyLatePenalty, computeLateness } from "./late-penalty.js";

type StaffAssignment = Awaited<ReturnType<typeof getStaffAssignment>>;

/** The teacher's score before any late penalty, validated against questions, rubric or total points. */
function teacherScore(assignment: StaffAssignment, input: ReviewInput): number {
  const rubric = assignment.rubric as { points: number }[];
  const questions = assignmentQuestions(assignment.questions);
  let score = input.score;
  if (questions.length) score = checkQuestionScores(questions, input.questionScores);
  if (rubric.length) {
    if (input.rubricScores.length !== rubric.length || input.rubricScores.some((s, i) => s > rubric[i].points)) throw badRequest("Score every rubric criterion within its limit");
    score = input.rubricScores.reduce((a, b) => a + b, 0);
  }
  if (score === undefined || score > Number(assignment.maxPoints)) throw badRequest("Enter a score within the assignment points");
  return score;
}

/** Audio feedback must be a recording this grader uploaded to this assignment. */
async function checkFeedbackAudio(actor: AuthUser, assignmentId: string, fileId: string | null): Promise<void> {
  if (!fileId) return;
  const file = await prisma.assignmentFile.findFirst({ where: { id: fileId, assignmentId, uploaderId: actor.id } });
  if (!file || !file.mimeType.startsWith("audio/")) throw badRequest("Record or upload the audio feedback again");
}

/** Lateness is re-checked at grading so an extension granted after submission is honoured. */
export async function submissionLateness(assignment: StaffAssignment, studentId: string, submittedAt: Date) {
  const extension = await prisma.assignmentExtension.findUnique({ where: { assignmentId_studentId: { assignmentId: assignment.id, studentId } }, select: { dueAt: true } });
  return computeLateness({ submittedAt, dueAt: assignment.dueAt, extensionDueAt: extension?.dueAt, policy: assignment });
}

export const reviewWork = async (actor: AuthUser, id: string, submissionId: string, input: ReviewInput) => {
  const assignment = await getStaffAssignment(actor, id);
  const submission = await prisma.assignmentSubmission.findFirst({ where: { id: submissionId, assignmentId: id }, include: { student: { select: { userId: true } }, versions: { where: { revision: { gt: 0 } }, orderBy: { revision: "desc" }, take: 1 } } });
  if (!submission) throw notFound("Submission not found");
  if (submission.status !== "SUBMITTED") throw conflict("Only submitted work can be reviewed");
  if (input.action === "RETURN" && submission.revision >= assignment.maxSubmissions) throw conflict("Increase the submission limit before requesting a revision");
  const grade = input.action === "GRADE";
  const rawScore = grade ? teacherScore(assignment, input) : null;
  await checkFeedbackAudio(actor, id, input.feedbackAudioFileId);
  const lateness = await submissionLateness(assignment, submission.studentId, submission.versions[0]?.submittedAt ?? submission.submittedAt ?? new Date());
  const penalty = grade ? input.penaltyOverride?.percent ?? lateness.penaltyPercent : null;
  const score = rawScore === null || penalty === null ? null : applyLatePenalty(rawScore, penalty);
  const questionScores = grade ? input.questionScores : submission.questionScores as Prisma.InputJsonValue;
  const review = { score, rawScore, latePenaltyPercent: penalty, feedback: input.feedback, feedbackAudioFileId: input.feedbackAudioFileId, rubricScores: input.rubricScores, questionScores, gradedAt: new Date() };
  const result = await prisma.$transaction(async (tx) => {
    const changed = await tx.assignmentSubmission.updateMany({ where: { id: submissionId, status: "SUBMITTED", revision: submission.revision }, data: { ...review, status: grade ? "GRADED" : "RETURNED" } });
    if (!changed.count) throw conflict("This submission has already been reviewed");
    await tx.assignmentVersion.update({ where: { submissionId_revision: { submissionId, revision: submission.revision } }, data: { ...review, isLate: lateness.isLate, lateByMinutes: lateness.lateByMinutes, gradedById: actor.id } });
    return tx.assignmentSubmission.findUniqueOrThrow({ where: { id: submissionId } });
  });
  await writeAudit({ actorId: actor.id, action: grade ? "HOMEWORK_GRADED" : "HOMEWORK_RETURNED", entityType: "AssignmentSubmission", entityId: submissionId, after: grade ? { rawScore, latePenaltyPercent: penalty, score } : undefined });
  if (grade && input.penaltyOverride && input.penaltyOverride.percent !== lateness.penaltyPercent)
    await writeAudit({ actorId: actor.id, action: "HOMEWORK_LATE_PENALTY_OVERRIDDEN", entityType: "AssignmentSubmission", entityId: submissionId, before: { latePenaltyPercent: lateness.penaltyPercent }, after: { latePenaltyPercent: penalty, score }, reason: input.penaltyOverride.reason });
  const body = input.feedback || "Your teacher recorded audio feedback. Open the assignment to listen.";
  await notifyUser(submission.student.userId, { type: "ASSIGNMENT", title: `${grade ? "Feedback ready" : "Revision requested"}: ${assignment.title}`, body, data: { assignmentId: id } });
  return result;
};

/** Waive or change the late penalty on graded work. The teacher's raw score is kept. */
export async function overridePenalty(actor: AuthUser, id: string, submissionId: string, input: PenaltyOverrideInput) {
  const assignment = await getStaffAssignment(actor, id);
  const submission = await prisma.assignmentSubmission.findFirst({ where: { id: submissionId, assignmentId: id, status: "GRADED" }, include: { student: { select: { userId: true } } } });
  if (!submission) throw conflict("Only graded work can have its late penalty changed");
  const rawScore = Number(submission.rawScore ?? submission.score ?? 0);
  const score = applyLatePenalty(rawScore, input.percent);
  const result = await prisma.$transaction(async (tx) => {
    const changed = await tx.assignmentSubmission.updateMany({ where: { id: submissionId, status: "GRADED", revision: submission.revision }, data: { score, rawScore, latePenaltyPercent: input.percent } });
    if (!changed.count) throw conflict("This submission changed. Reload and try again");
    await tx.assignmentVersion.update({ where: { submissionId_revision: { submissionId, revision: submission.revision } }, data: { score, rawScore, latePenaltyPercent: input.percent } });
    return tx.assignmentSubmission.findUniqueOrThrow({ where: { id: submissionId } });
  });
  await writeAudit({ actorId: actor.id, action: "HOMEWORK_LATE_PENALTY_OVERRIDDEN", entityType: "AssignmentSubmission", entityId: submissionId, before: { latePenaltyPercent: submission.latePenaltyPercent?.toString() ?? null, score: submission.score?.toString() ?? null }, after: { latePenaltyPercent: input.percent, score }, reason: input.reason });
  await notifyUser(submission.student.userId, { type: "ASSIGNMENT", title: `Grade updated: ${assignment.title}`, body: input.percent ? `Your late penalty is now ${input.percent}%. Your score is ${score}/${Number(assignment.maxPoints)}.` : `Your late penalty was waived. Your score is ${score}/${Number(assignment.maxPoints)}.`, data: { assignmentId: id } });
  return result;
}
