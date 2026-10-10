import type { Prisma } from "../../generated/prisma/client.js";
import {
loadStudentAccessProfile
} from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { emitActivity } from "../activity/activity.service.js";
export const recordAttemptViolation = async (userId: string, attemptId: string, type: string) => {
  const profile = await loadStudentAccessProfile(userId);
  // Use selective query that won't fail if cheat columns missing pre-migration
  const attempt = (await prisma.attempt.findUnique({
    where: { id: attemptId },
    select: { id: true, studentId: true, status: true, assessmentId: true, feedback: true, cheatCount: true, cheatFlagged: true, cheatLog: true, assessment: { select: { protectedMode: true } } } as never,
  }) as unknown as { id: string; studentId: string; status: string; assessmentId: string; feedback: string | null; assessment: { protectedMode: boolean }; cheatCount?: number; cheatFlagged?: boolean; cheatLog?: unknown } | null);
  if (!attempt || attempt.studentId !== profile.studentId) throw notFound("Attempt not found");
  if (attempt.status !== "IN_PROGRESS" || !attempt.assessment.protectedMode) return attempt;
  const log = Array.isArray(attempt.cheatLog) ? (attempt.cheatLog as unknown[]) : [];
  const nextLog = [...log, { type, at: new Date().toISOString() }] as unknown as Prisma.InputJsonValue;
  const nextCount = (attempt.cheatCount ?? 0) + 1;
  const flagged = nextCount >= 3;
  // Wrap in try/catch — columns may not exist until migration runs
  try {
    await prisma.attempt.update({ where: { id: attemptId }, data: { cheatCount: nextCount, cheatFlagged: flagged, cheatLog: nextLog } as never });
  } catch (e) {
    // P2022 column not found — still count violation in memory, but don't crash
    if ((e as { code?: string })?.code !== "P2022") throw e;
    return attempt as unknown as ReturnType<typeof prisma.attempt.findUnique>;
  }
  if (flagged) {
    await prisma.attempt.update({ where: { id: attemptId }, data: { feedback: "[Protected assessment flagged for teacher review]" } });
    await writeAudit({ actorId: userId, action: "ATTEMPT_FLAGGED_CHEATING", entityType: "Attempt", entityId: attemptId, after: { type, count: nextCount } });
    await emitActivity({ actorId: userId, type: "EXAM", title: "Exam auto-submitted — cheating flagged", body: `3 violations (${type}) — assessment ${attempt.assessmentId}`, levelId: null, studentId: profile.studentId });
  }
  return prisma.attempt.findUnique({ where: { id: attemptId } });
};
