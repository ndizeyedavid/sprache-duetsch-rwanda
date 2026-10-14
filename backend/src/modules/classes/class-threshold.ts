import { env } from "../../config/env.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { resolveAttendanceThreshold } from "../sessions/attendance-threshold.js";

type WithThreshold = { attendanceAlertThreshold: number | null; level: { attendanceAlertThreshold: number | null } };

/** Adds the effective + inherited low-attendance threshold so editors can show where it comes from. */
export const withAttendanceThreshold = <T extends WithThreshold>(row: T) => ({
  ...row,
  attendanceThreshold: resolveAttendanceThreshold(row.attendanceAlertThreshold, row.level.attendanceAlertThreshold, env.ATTENDANCE_ALERT_THRESHOLD),
});

/** What a new class at this level would inherit (level override, else the system default). */
export async function getInheritedThreshold(levelId: string) {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { attendanceAlertThreshold: true } });
  if (!level) throw notFound("Level not found");
  return { ...resolveAttendanceThreshold(null, level.attendanceAlertThreshold, env.ATTENDANCE_ALERT_THRESHOLD), system: env.ATTENDANCE_ALERT_THRESHOLD };
}
