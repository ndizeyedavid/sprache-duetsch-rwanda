import { Prisma } from "../../generated/prisma/client.js";
import {
assertLevelAccess,
assertPaymentAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,forbidden,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
export const startAttempt = async (userId: string, assessmentId: string) => transact(async tx => {
  const assessment = await tx.assessment.findUnique({
    where: { id: assessmentId },
    select: {
      id: true,
      levelId: true,
      isPublished: true,
      protectedMode: true,
      durationMinutes: true,
      maxAttempts: true,
      passMark: true,
      availableFrom: true,
      availableUntil: true,
      prerequisiteLessonId: true,
      questions: { orderBy: { order: "asc" }, include: { question: true } },
    },
  });

  if (!assessment || !assessment.isPublished) {
    throw notFound("Assessment not found");
  }

  await assertLevelAccess(userId, assessment.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "ASSESSMENT");

  if (assessment.prerequisiteLessonId) {
    const prerequisite = await tx.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: profile.studentId,
          lessonId: assessment.prerequisiteLessonId,
        },
      },
      select: { status: true },
    });
    if (prerequisite?.status !== "COMPLETED") {
      throw forbidden("Complete the prerequisite lesson before starting this assessment");
    }
  }

  const now = new Date();
  if (assessment.availableFrom && now < assessment.availableFrom) {
    throw badRequest("This assessment is not yet available");
  }

  const existing = await tx.attempt.findFirst({
    where: { assessmentId, studentId: profile.studentId, status: "IN_PROGRESS" },
    orderBy: { startedAt: "desc" },
    select: { id: true, startedAt: true, assessmentId: true, studentId: true, status: true, draftResponses: true } as never,
  } as never);
  if (existing) {
    return existing;
  }

  if (assessment.availableUntil && now > assessment.availableUntil) throw badRequest("This assessment is no longer available");
  const attemptCount = await tx.attempt.count({
    where: { assessmentId, studentId: profile.studentId } as never,
  });
  if (attemptCount >= assessment.maxAttempts) {
    throw forbidden("You have reached the maximum number of attempts");
  }

  const maxScore = assessment.questions.reduce(
    (sum, row) => sum + Number(row.points ?? row.question.points),
    0,
  );

  const attempt = await tx.attempt.create({
    data: {
      assessmentId,
      studentId: profile.studentId,
      attemptNumber: attemptCount + 1,
      status: "IN_PROGRESS",
      maxScore: new Prisma.Decimal(maxScore),
      startedAt: now,
      questionSnapshot: JSON.parse(JSON.stringify({ questions: assessment.questions, durationMinutes: assessment.durationMinutes, passMark: assessment.passMark })) as Prisma.InputJsonValue,
    },
  });

  await writeAuditTx(tx, {
    actorId: userId,
    action: "ATTEMPT_STARTED",
    entityType: "Attempt",
    entityId: attempt.id,
    after: attempt,
  });

  return { id: attempt.id, startedAt: attempt.startedAt, assessmentId, studentId: profile.studentId, status: attempt.status, draftResponses: attempt.draftResponses };
});
