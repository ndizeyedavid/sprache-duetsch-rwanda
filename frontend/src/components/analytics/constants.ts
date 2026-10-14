import type { RiskLevel,RiskReasonCode } from '../../lib/analytics-api';

/** Short badge text per reason; the full sentence comes from the API label (shown as a tooltip). */
export const REASON_SHORT: Record<RiskReasonCode, string> = {
  LOW_ATTENDANCE: 'Attendance',
  LOW_SCORE: 'Low scores',
  MISSING_HOMEWORK: 'Missing homework',
  INACTIVE: 'Inactive',
  OVERDUE_FEES: 'Overdue fees',
};

export const SEVERITY_BADGE: Record<RiskLevel, string> = {
  HIGH: 'badge-error',
  MEDIUM: 'badge-warning',
};

export const RISK_LABEL: Record<RiskLevel, string> = { HIGH: 'High', MEDIUM: 'Medium' };

export const RISK_FILTERS = ['All', 'High', 'Medium'] as const;
export type RiskFilterLabel = (typeof RISK_FILTERS)[number];
export const riskFromLabel = (label: string): RiskLevel | undefined =>
  label === 'High' ? 'HIGH' : label === 'Medium' ? 'MEDIUM' : undefined;
