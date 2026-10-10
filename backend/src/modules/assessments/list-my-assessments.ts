import type { Prisma } from "../../generated/prisma/client.js";
import {
assertAccountActive,
assertPaymentAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
MyAssessmentsQuery
} from "./assessments.schema.js";
export const listMyAssessments = async (userId: string, query: MyAssessmentsQuery) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  assertPaymentAccess(profile, "ASSESSMENT");

  const pagination = parsePagination(query);
  const where: Prisma.AssessmentWhereInput = {
    isPublished: true,
    levelId: { in: profile.levelIds },
  };

  const [rows, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
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
        level: { select: { id: true, code: true, title: true, levelLabel: true } },
        questions: { select: { points: true, question: { select: { points: true } } } },
        attempts: {
          where: { studentId: profile.studentId },
          select: { score: true, maxScore: true, status: true, passed: true, submittedAt: true, gradedAt: true },
        },
      },
    }),
    prisma.assessment.count({ where }),
  ]);

  const data = rows.map(({ attempts, questions, ...assessment }) => {
    const maxScore = questions.reduce((sum, q) => sum + Number(q.points ?? q.question.points), 0);
    const bestScore = attempts.reduce<number | null>((best, attempt) => {
      if (attempt.score === null) return best;
      const value = Number(attempt.score);
      return best === null || value > best ? value : best;
    }, null);
    const latest = attempts.length ? attempts.reduce((a, b) => (a.submittedAt && b.submittedAt ? (a.submittedAt > b.submittedAt ? a : b) : a)) : null;
    return {
      ...assessment,
      attemptCount: attempts.length,
      bestScore,
      maxScore: maxScore || (attempts[0] ? Number(attempts[0].maxScore) : 0),
      latestStatus: latest?.status ?? null,
      latestSubmittedAt: latest?.submittedAt ?? null,
      attempts,
    };
  });

  return buildPaginated(data, total, pagination);
};
