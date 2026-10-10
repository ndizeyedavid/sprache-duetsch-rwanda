import { Prisma } from "../../generated/prisma/client.js";
import {
loadStudentAccessProfile
} from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import { emitActivity } from "../activity/activity.service.js";
export const recordActivityViolation = async (userId: string, activityId: string, type: string) => {
  const profile = await loadStudentAccessProfile(userId);
  // Select only safe columns pre-migration
  const existing = await prisma.activitySubmission.findUnique({
    where: { activityId_studentId: { activityId, studentId: profile.studentId } },
    select: { id: true, cheatCount: true, cheatLog: true, cheatFlagged: true },
  });
  // If columns missing, this query itself would have thrown P2022 — catch at call site
  const safeExisting = existing;
  const prevLog = safeExisting?.cheatLog;
  const log = Array.isArray(prevLog) ? (prevLog as unknown[]) : [];
  const nextLog = [...log, { type, at: new Date().toISOString() }] as unknown as Prisma.InputJsonValue;
  const nextCount = (safeExisting?.cheatCount ?? 0) + 1;
  const flagged = nextCount >= 3;
  let upserted: unknown;
  try {
    upserted = await prisma.activitySubmission.upsert({
      where: { activityId_studentId: { activityId, studentId: profile.studentId } },
      create: { activityId, studentId: profile.studentId, response: Prisma.DbNull, status: "SUBMITTED", submittedAt: new Date(), cheatCount: nextCount, cheatFlagged: flagged, cheatLog: nextLog, feedback: flagged ? "[Auto-submitted — 3 violations, flagged for review]" : null },
      update: { cheatCount: nextCount, cheatFlagged: flagged, cheatLog: nextLog, ...(flagged ? { status: "SUBMITTED", submittedAt: new Date(), feedback: "[Flagged — 3 violations, awaiting teacher review]" } : {}) },
    });
  } catch (e) {
    if ((e as { code?: string })?.code === "P2022") {
      // Columns not migrated — at least create a submitted flag so frontend doesn't falsely recover
      upserted = await prisma.activitySubmission.upsert({
        where: { activityId_studentId: { activityId, studentId: profile.studentId } },
        create: { activityId, studentId: profile.studentId, response: Prisma.DbNull, status: "SUBMITTED", submittedAt: new Date(), feedback: "[Flagged — anti-cheat violation]" },
        update: { status: "SUBMITTED", submittedAt: new Date(), feedback: "[Flagged — anti-cheat violation]" },
      });
    } else throw e;
  }
  if (flagged) {
    await writeAudit({ actorId: userId, action: "ACTIVITY_FLAGGED_CHEATING", entityType: "ActivitySubmission", entityId: (upserted as { id: string }).id, after: { type, count: nextCount } });
    const act = await prisma.activity.findUnique({ where: { id: activityId }, select: { lesson: { select: { module: { select: { levelId: true } } } } } });
    await emitActivity({ actorId: userId, type: "ASSIGNMENT", title: "Activity auto-submitted — cheating flagged", body: `3 violations (${type})`, levelId: act?.lesson.module.levelId ?? null, studentId: profile.studentId });
  }
  return upserted;
};
