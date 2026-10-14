import { prisma } from "../../lib/prisma.js";
import type { HomeworkDue } from "./missing-homework.js";
import { toPercent } from "./risk-policy.js";

const push = <T>(map: Map<string, T[]>, key: string, value: T) => {
  const list = map.get(key);
  if (list) list.push(value); else map.set(key, [value]);
};
const SUBMITTED = ["SUBMITTED", "RETURNED", "GRADED"] as const;

/** Raw academic signals for a set of students/classes. Keys are `${studentId}:${classOrLevelId}`. */
export async function loadRiskSignals(studentIds: string[], classIds: string[], now: Date) {
  const student = { in: studentIds };
  const [attendance, attempts, homeworkScores, homework, progress, activity, attemptActivity, submissionActivity] = await Promise.all([
    prisma.attendance.findMany({ where: { studentId: student, session: { classGroupId: { in: classIds }, status: { not: "CANCELLED" } } },
      select: { studentId: true, status: true, session: { select: { classGroupId: true } } } }),
    prisma.attempt.findMany({ where: { studentId: student, status: "GRADED", score: { not: null }, assessment: { type: { not: "PLACEMENT" } } },
      select: { studentId: true, score: true, maxScore: true, assessment: { select: { levelId: true } } } }),
    prisma.assignmentSubmission.findMany({ where: { studentId: student, status: "GRADED", score: { not: null }, assignment: { classGroupId: { in: classIds } } },
      select: { studentId: true, score: true, assignment: { select: { classGroupId: true, maxPoints: true } } } }),
    prisma.assignment.findMany({ where: { classGroupId: { in: classIds }, status: "PUBLISHED", dueAt: { not: null, lt: now }, OR: [{ releaseAt: null }, { releaseAt: { lte: now } }] },
      select: { classGroupId: true, dueAt: true, recipients: { select: { studentId: true } },
        submissions: { where: { studentId: student, status: { in: [...SUBMITTED] } }, select: { studentId: true } },
        extensions: { where: { studentId: student }, select: { studentId: true, dueAt: true } } } }),
    prisma.lessonProgress.groupBy({ by: ["studentId"], where: { studentId: student }, _max: { updatedAt: true } }),
    prisma.activitySubmission.groupBy({ by: ["studentId"], where: { studentId: student }, _max: { submittedAt: true } }),
    prisma.attempt.groupBy({ by: ["studentId"], where: { studentId: student }, _max: { startedAt: true } }),
    prisma.assignmentSubmission.groupBy({ by: ["studentId"], where: { studentId: student, submittedAt: { not: null } }, _max: { submittedAt: true } }),
  ]);
  const attendanceByClass = new Map<string, string[]>();
  for (const row of attendance) push(attendanceByClass, `${row.studentId}:${row.session.classGroupId}`, row.status);
  const attemptScores = new Map<string, number[]>();
  for (const row of attempts) {
    const pct = toPercent(Number(row.score), Number(row.maxScore));
    if (pct !== null) push(attemptScores, `${row.studentId}:${row.assessment.levelId}`, pct);
  }
  const homeworkByClass = new Map<string, number[]>();
  for (const row of homeworkScores) {
    const pct = toPercent(Number(row.score), Number(row.assignment.maxPoints));
    if (pct !== null) push(homeworkByClass, `${row.studentId}:${row.assignment.classGroupId}`, pct);
  }
  const assignments: HomeworkDue[] = homework.map(row => ({ classGroupId: row.classGroupId, dueAt: row.dueAt!,
    recipientIds: row.recipients.map(r => r.studentId), submittedIds: row.submissions.map(s => s.studentId), extensions: row.extensions }));
  const lastActivity = new Map<string, Date>();
  const seen = (studentId: string, at: Date | null | undefined) => {
    if (at && at > (lastActivity.get(studentId) ?? new Date(0))) lastActivity.set(studentId, at);
  };
  for (const row of progress) seen(row.studentId, row._max.updatedAt);
  for (const row of activity) seen(row.studentId, row._max.submittedAt);
  for (const row of attemptActivity) seen(row.studentId, row._max.startedAt);
  for (const row of submissionActivity) seen(row.studentId, row._max.submittedAt);
  return { attendanceByClass, attemptScores, homeworkByClass, assignments, lastActivity };
}

/** Finance read for SUPER_ADMIN only: students whose finance profile shows an overdue amount. */
export async function overdueStudentIds(studentIds: string[]): Promise<Set<string>> {
  const rows = await prisma.studentFinance.findMany({ where: { studentId: { in: studentIds }, overdueAmount: { gt: 0 } }, select: { studentId: true } });
  return new Set(rows.map(row => row.studentId));
}
