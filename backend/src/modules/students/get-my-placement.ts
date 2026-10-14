import { prisma } from "../../lib/prisma.js";
import { readAttemptPolicy } from "../assessments/attempt-snapshot.js";
import { placementStatus } from "./placement-decision.js";
import { attemptDeadline,findPlacementTest,loadPlacementStudent } from "./placement-test.js";
import { placementResultSelect,toStudentPlacement } from "./placement-view.js";

/** Student self-service: test availability, open attempt, latest result and history. */
export const getMyPlacement = async (userId: string) => {
  const student = await loadPlacementStudent(userId);
  const test = await findPlacementTest();
  const [attempts, results, intendedLevel] = await Promise.all([
    test
      ? prisma.attempt.findMany({
          where: { studentId: student.id, assessmentId: test.id },
          orderBy: { startedAt: "desc" },
          select: { id: true, status: true, startedAt: true },
        })
      : Promise.resolve([]),
    prisma.placementResult.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: "desc" },
      select: placementResultSelect,
    }),
    student.intendedLevelId
      ? prisma.level.findUnique({
          where: { id: student.intendedLevelId },
          select: { id: true, code: true, title: true, levelLabel: true },
        })
      : Promise.resolve(null),
  ]);

  const active = attempts.find((attempt) => attempt.status === "IN_PROGRESS") ?? null;
  const snapshot = active
    ? await prisma.attempt.findUnique({ where: { id: active.id }, select: { questionSnapshot: true } })
    : null;
  const policy = test && snapshot ? readAttemptPolicy(snapshot.questionSnapshot, test) : null;
  const latest = results[0] ?? null;
  const questionCount = test?._count.questions ?? 0;

  return {
    status: placementStatus({ hasTest: Boolean(test && questionCount > 0), hasActiveAttempt: Boolean(active), latest }),
    test: test
      ? {
          id: test.id,
          title: test.title,
          description: test.description,
          durationMinutes: test.durationMinutes,
          maxAttempts: test.maxAttempts,
          questionCount,
        }
      : null,
    attemptsUsed: attempts.length,
    canStart: Boolean(test && questionCount > 0 && (active || attempts.length < test.maxAttempts)),
    activeAttempt: active
      ? { id: active.id, startedAt: active.startedAt, expiresAt: attemptDeadline(active.startedAt, policy?.durationMinutes) }
      : null,
    intendedLevel,
    latest: latest ? toStudentPlacement(latest) : null,
    history: results.map(toStudentPlacement),
  };
};
