import {
assertAccountActive,
loadStudentAccessProfile
} from "../../lib/access.js";
import { prisma } from "../../lib/prisma.js";
export const listMyAttempts = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);

  return prisma.attempt.findMany({
    where: { studentId: profile.studentId },
    orderBy: { startedAt: "desc" },
    select: {
      id: true,
      attemptNumber: true,
      status: true,
      score: true,
      maxScore: true,
      passed: true,
      startedAt: true,
      submittedAt: true,
      gradedAt: true,
      assessment: { select: { id: true, title: true } },
    },
  });
};
