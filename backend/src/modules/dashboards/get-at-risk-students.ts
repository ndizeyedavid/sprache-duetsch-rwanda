import { env } from "../../config/env.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { attendanceRate,resolveAttendanceThreshold } from "../sessions/attendance-threshold.js";
import type { AtRiskQuery } from "./analytics.schema.js";
import type { AnalyticsActor,AtRiskFilter } from "./at-risk-scope.js";
import { atRiskEnrollmentSelect,atRiskEnrollmentWhere } from "./at-risk-scope.js";
import { loadRiskSignals,overdueStudentIds } from "./at-risk-signals.js";
import { missingHomeworkCount } from "./missing-homework.js";
import { averagePercent,daysBetween,riskLevel,riskPoints,riskReasons } from "./risk-policy.js";

/**
 * One row per active enrolment (student + class) that has at least one risk reason.
 * Overdue fees are only considered for SUPER_ADMIN; academic admins and teachers never see money.
 */
export async function computeAtRisk(actor: AnalyticsActor, filter: AtRiskFilter, inactivityDays = 14, now = new Date()) {
  const enrollments = await prisma.enrollment.findMany({ where: await atRiskEnrollmentWhere(actor, filter), select: atRiskEnrollmentSelect });
  if (!enrollments.length) return [];
  const studentIds = [...new Set(enrollments.map(e => e.studentId))];
  const classIds = [...new Set(enrollments.flatMap(e => (e.classGroupId ? [e.classGroupId] : [])))];
  const signals = await loadRiskSignals(studentIds, classIds, now);
  const overdue = actor.role === "SUPER_ADMIN" ? await overdueStudentIds(studentIds) : new Set<string>();
  return enrollments.flatMap(e => {
    const threshold = resolveAttendanceThreshold(e.classGroup?.attendanceAlertThreshold, e.level.attendanceAlertThreshold, env.ATTENDANCE_ALERT_THRESHOLD).value;
    const classKey = e.classGroupId ? `${e.studentId}:${e.classGroupId}` : null;
    const rate = classKey ? attendanceRate(signals.attendanceByClass.get(classKey) ?? []) : null;
    const averageScore = averagePercent([...(signals.attemptScores.get(`${e.studentId}:${e.levelId}`) ?? []), ...(classKey ? signals.homeworkByClass.get(classKey) ?? [] : [])]);
    const missingHomework = e.classGroupId ? missingHomeworkCount(signals.assignments, e.studentId, e.classGroupId, e.enrolledAt, now) : 0;
    const lastActivityAt = signals.lastActivity.get(e.studentId) ?? null;
    const reasons = riskReasons({ attendanceRate: rate, attendanceThreshold: threshold, averageScore, missingHomework, inactivityDays,
      daysInactive: daysBetween(lastActivityAt ?? e.enrolledAt, now), neverActive: !lastActivityAt, overdueFees: overdue.has(e.studentId) });
    const level = riskLevel(reasons);
    if (!level) return [];
    return [{
      enrollmentId: e.id,
      student: { id: e.studentId, studentCode: e.student.studentCode, ...e.student.user },
      classGroup: e.classGroup ? { id: e.classGroup.id, code: e.classGroup.code, name: e.classGroup.name } : null,
      level: { id: e.level.id, code: e.level.code },
      intake: e.intake,
      riskLevel: level, riskPoints: riskPoints(reasons), reasons,
      attendanceRate: rate, attendanceThreshold: threshold, averageScore, missingHomework, lastActivityAt,
    }];
  });
}

export type AtRiskRow = Awaited<ReturnType<typeof computeAtRisk>>[number];

const byRisk = (a: AtRiskRow, b: AtRiskRow) =>
  Number(b.riskLevel === "HIGH") - Number(a.riskLevel === "HIGH") || b.riskPoints - a.riskPoints
  || `${a.student.lastName} ${a.student.firstName}`.localeCompare(`${b.student.lastName} ${b.student.firstName}`);

export async function getAtRiskStudents(actor: AnalyticsActor, query: AtRiskQuery) {
  const rows = await computeAtRisk(actor, query, query.inactivityDays);
  const summary = {
    total: rows.length,
    students: new Set(rows.map(row => row.student.id)).size,
    high: rows.filter(row => row.riskLevel === "HIGH").length,
    medium: rows.filter(row => row.riskLevel === "MEDIUM").length,
  };
  const visible = rows.filter(row => !query.riskLevel || row.riskLevel === query.riskLevel).sort(byRisk);
  const pagination = parsePagination(query);
  return { ...buildPaginated(visible.slice(pagination.skip, pagination.skip + pagination.take), visible.length, pagination), summary };
}
