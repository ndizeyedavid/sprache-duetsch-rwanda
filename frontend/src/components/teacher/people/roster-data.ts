import type { AtRiskRow,RiskLevel } from '../../../lib/analytics-api';
import type { ClassGroupDetail } from '../../../lib/services/class-group-detail';

export type ClassAttendance = { studentId: string; present: number; absent: number; late: number; excused: number; total: number; percentage: number };
export type ClassAttempt = { status: string; score: number | string | null; maxScore: number | string; student: { studentCode: string } };

export type RosterStudent = {
  userId: string; studentId: string; code: string; name: string; firstName: string; lastName: string; email: string;
  status: string;
  attendance: { percentage: number; total: number } | null;
  /** Average graded score, 0–100. */
  score: number | null;
  graded: number;
  risk: { level: RiskLevel; reasons: string[] } | null;
  lastActivityAt: string | null;
};

/** One row per enrolled learner with attendance, average score and support flags merged in. */
export function buildRoster(enrollments: ClassGroupDetail['enrollments'], attendance: ClassAttendance[] = [], attempts: ClassAttempt[] = [], risks: AtRiskRow[] = []): RosterStudent[] {
  return enrollments.map(({ student }) => {
    const att = attendance.find((row) => row.studentId === student.id);
    const graded = attempts.filter((a) => a.student.studentCode === student.studentCode && a.status === 'GRADED' && a.score !== null && Number(a.maxScore) > 0);
    const risk = risks.find((row) => row.student.id === student.id);
    return {
      userId: student.user.id, studentId: student.id, code: student.studentCode,
      name: `${student.user.firstName} ${student.user.lastName}`, firstName: student.user.firstName, lastName: student.user.lastName,
      email: student.user.email, status: student.status,
      attendance: att && att.total > 0 ? { percentage: Math.round(att.percentage), total: att.total } : null,
      score: graded.length ? Math.round(graded.reduce((sum, a) => sum + (Number(a.score) / Number(a.maxScore)) * 100, 0) / graded.length) : null,
      graded: graded.length,
      risk: risk ? { level: risk.riskLevel, reasons: risk.reasons.map((reason) => reason.label) } : null,
      lastActivityAt: risk?.lastActivityAt ?? null,
    };
  });
}

export type RosterSort = 'name' | 'code' | 'attendance' | 'score';
export type RosterFilter = { query: string; status: string; support: boolean; sort: RosterSort };

/** Lowest attendance / score first, so the learners who need you rise to the top. */
export function filterRoster(rows: RosterStudent[], { query, status, support, sort }: RosterFilter): RosterStudent[] {
  const needle = query.trim().toLowerCase();
  const list = rows.filter((row) => (!needle || `${row.name} ${row.code} ${row.email}`.toLowerCase().includes(needle))
    && (status === 'ALL' || row.status === status) && (!support || row.risk));
  const metric = (value: number | null) => value ?? 101;
  return list.sort((a, b) => sort === 'code' ? a.code.localeCompare(b.code)
    : sort === 'attendance' ? metric(a.attendance?.percentage ?? null) - metric(b.attendance?.percentage ?? null)
      : sort === 'score' ? metric(a.score) - metric(b.score)
        : a.name.localeCompare(b.name));
}

export function average(values: (number | null | undefined)[]): number | null {
  const present = values.filter((value): value is number => typeof value === 'number');
  return present.length ? Math.round(present.reduce((sum, value) => sum + value, 0) / present.length) : null;
}
