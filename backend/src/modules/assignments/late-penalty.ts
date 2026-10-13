// Pure late-work rules. Everything is measured in epoch milliseconds, so the result never
// depends on the server or student time zone (or daylight-saving changes): a "day" is a
// 24-hour period that starts at the effective deadline.
const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

export interface LatePolicy {
  gracePeriodMinutes: number;
  latePenaltyPercentPerDay: number | string | { toString(): string };
  latePenaltyMaxPercent: number | string | { toString(): string };
}

export interface Lateness {
  /** Submitted after the deadline plus the grace period. */
  isLate: boolean;
  /** Whole minutes (rounded up) after the effective deadline, or null when on time. */
  lateByMinutes: number | null;
  /** Percentage of the teacher's score that is deducted (0–100). */
  penaltyPercent: number;
}

const round2 = (value: number): number => Math.round(value * 100) / 100;
const clampPercent = (value: number): number => (Number.isFinite(value) ? Math.min(100, Math.max(0, value)) : 0);

/** An extension can only move a deadline later; without a deadline there is nothing to extend. */
export function effectiveDueAt(dueAt: Date | null, extensionDueAt?: Date | null): Date | null {
  if (!dueAt) return null;
  return extensionDueAt && extensionDueAt.getTime() > dueAt.getTime() ? extensionDueAt : dueAt;
}

/**
 * Lateness of a submission. Work inside the grace period is on time. After it, every started
 * 24-hour period counted from the deadline costs `latePenaltyPercentPerDay`, capped at
 * `latePenaltyMaxPercent`.
 */
export function computeLateness(input: { submittedAt: Date; dueAt: Date | null; extensionDueAt?: Date | null; policy: LatePolicy }): Lateness {
  const due = effectiveDueAt(input.dueAt, input.extensionDueAt);
  const lateMs = due ? input.submittedAt.getTime() - due.getTime() : 0;
  if (lateMs <= 0) return { isLate: false, lateByMinutes: null, penaltyPercent: 0 };
  const lateByMinutes = Math.ceil(lateMs / MINUTE);
  const grace = Math.max(0, input.policy.gracePeriodMinutes) * MINUTE;
  if (lateMs <= grace) return { isLate: false, lateByMinutes, penaltyPercent: 0 };
  const days = Math.ceil(lateMs / DAY);
  const perDay = clampPercent(Number(input.policy.latePenaltyPercentPerDay));
  const cap = clampPercent(Number(input.policy.latePenaltyMaxPercent));
  return { isLate: true, lateByMinutes, penaltyPercent: round2(Math.min(cap, days * perDay)) };
}

/** score = rawScore × (1 − penalty%), using integer hundredths so 2-decimal scores stay exact. */
export function applyLatePenalty(rawScore: number, penaltyPercent: number): number {
  const raw = Math.round(rawScore * 100);
  const basisPoints = Math.round(clampPercent(penaltyPercent) * 100);
  return Math.round((raw * (10_000 - basisPoints)) / 10_000) / 100;
}
