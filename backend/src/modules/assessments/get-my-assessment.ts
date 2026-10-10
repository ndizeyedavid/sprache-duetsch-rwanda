import {
assertLevelAccess,
assertPaymentAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { publicSnapshot,readAttemptPolicy,readSnapshot } from "./attempt-snapshot.js";
export const getMyAssessment = async (userId: string, id: string) => {
  const assessment = await prisma.assessment.findUnique({
    where: { id },
    select: {
      id: true,
      levelId: true,
      title: true,
      description: true,
      type: true,
      protectedMode: true,
      durationMinutes: true,
      maxAttempts: true,
      passMark: true,
      availableFrom: true,
      availableUntil: true,
      isPublished: true,
      questions: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          order: true,
          points: true,
          question: {
            select: {
              id: true,
              type: true,
              skill: true,
              difficulty: true,
              prompt: true,
              options: true,
              imageUrl: true,
              audioUrl: true,
              points: true,
            },
          },
        },
      },
    },
  });

  if (!assessment || !assessment.isPublished) {
    throw notFound("Assessment not found");
  }

  await assertLevelAccess(userId, assessment.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "ASSESSMENT");

  const now = new Date();
  if (assessment.availableFrom && now < assessment.availableFrom) {
    throw badRequest("This assessment is not yet available");
  }

  const attempts = await prisma.attempt.findMany({
    where: { assessmentId: id, studentId: profile.studentId },
    select: { status: true },
  });

  if (assessment.availableUntil && now > assessment.availableUntil && !attempts.length) throw badRequest("This assessment is no longer available");
  const { isPublished: _isPublished, ...meta } = assessment;
  const active = await prisma.attempt.findFirst({ where: { assessmentId: id, studentId: profile.studentId, status: "IN_PROGRESS" }, orderBy: { startedAt: "desc" } });
  const snapshot = active ? readSnapshot(active.questionSnapshot) : null;
  return { ...meta, ...(active ? readAttemptPolicy(active.questionSnapshot, assessment) : {}), questions: snapshot ? publicSnapshot(snapshot) : meta.questions, attemptCount: attempts.length };
};
