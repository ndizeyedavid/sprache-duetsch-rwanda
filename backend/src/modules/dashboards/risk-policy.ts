/** Pure at-risk scoring: signals in, reasons + risk level out. */
export type RiskReasonCode = 'LOW_ATTENDANCE' | 'LOW_SCORE' | 'MISSING_HOMEWORK' | 'INACTIVE' | 'OVERDUE_FEES';
export type RiskSeverity = 'HIGH' | 'MEDIUM';
export type RiskLevel = 'HIGH' | 'MEDIUM';

export interface RiskReason { code: RiskReasonCode; severity: RiskSeverity; label: string; value?: number; threshold?: number }

export interface RiskSignals {
  attendanceRate: number | null;
  attendanceThreshold: number;
  /** Average of graded assessments + homework, as a percentage. */
  averageScore: number | null;
  missingHomework: number;
  /** Days since the last learning activity, or since enrolment when never active. */
  daysInactive: number;
  neverActive: boolean;
  inactivityDays: number;
  /** Only ever set for super admins. */
  overdueFees?: boolean;
}

export const LOW_SCORE_THRESHOLD = 50;
const SEVERE_SCORE = 35;
const SEVERE_ATTENDANCE_GAP = 20;
const SEVERE_MISSING = 3;

export function riskReasons(s: RiskSignals): RiskReason[] {
  const reasons: RiskReason[] = [];
  if (s.attendanceRate !== null && s.attendanceRate < s.attendanceThreshold) reasons.push({
    code: 'LOW_ATTENDANCE', severity: s.attendanceRate < s.attendanceThreshold - SEVERE_ATTENDANCE_GAP ? 'HIGH' : 'MEDIUM',
    label: `Attendance ${s.attendanceRate}% (needs ${s.attendanceThreshold}%)`, value: s.attendanceRate, threshold: s.attendanceThreshold,
  });
  if (s.averageScore !== null && s.averageScore < LOW_SCORE_THRESHOLD) reasons.push({
    code: 'LOW_SCORE', severity: s.averageScore < SEVERE_SCORE ? 'HIGH' : 'MEDIUM',
    label: `Average score ${s.averageScore}%`, value: s.averageScore, threshold: LOW_SCORE_THRESHOLD,
  });
  if (s.missingHomework > 0) reasons.push({
    code: 'MISSING_HOMEWORK', severity: s.missingHomework >= SEVERE_MISSING ? 'HIGH' : 'MEDIUM',
    label: `${s.missingHomework} missing homework`, value: s.missingHomework,
  });
  if (s.daysInactive >= s.inactivityDays) reasons.push({
    code: 'INACTIVE', severity: s.daysInactive >= s.inactivityDays * 2 ? 'HIGH' : 'MEDIUM',
    label: s.neverActive ? `No activity since enrolment (${s.daysInactive} days)` : `Inactive for ${s.daysInactive} days`,
    value: s.daysInactive, threshold: s.inactivityDays,
  });
  if (s.overdueFees) reasons.push({ code: 'OVERDUE_FEES', severity: 'MEDIUM', label: 'Overdue fees' });
  return reasons;
}

/** HIGH = 2 points, MEDIUM = 1. One medium reason is MEDIUM risk; anything more is HIGH. */
export const riskPoints = (reasons: readonly RiskReason[]) => reasons.reduce((sum, r) => sum + (r.severity === 'HIGH' ? 2 : 1), 0);

export function riskLevel(reasons: readonly RiskReason[]): RiskLevel | null {
  const points = riskPoints(reasons);
  return points === 0 ? null : points >= 2 ? 'HIGH' : 'MEDIUM';
}

/** Whole days between two instants (floored, never negative). */
export const daysBetween = (from: Date, to: Date) => Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86_400_000));

/** Mean of percentages, 2 decimals; null when empty. */
export function averagePercent(values: readonly number[]): number | null {
  if (!values.length) return null;
  return Math.round((values.reduce((sum, v) => sum + v, 0) / values.length) * 100) / 100;
}

/** Score as a percentage of its maximum; null when there is no usable maximum. */
export const toPercent = (score: number, max: number) => (max > 0 ? (score / max) * 100 : null);
