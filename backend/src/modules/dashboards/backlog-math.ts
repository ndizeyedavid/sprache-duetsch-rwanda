/** Pure grading-backlog math (ages and turnaround in hours, 1 decimal). */
const HOUR = 3_600_000;
const round1 = (value: number) => Math.round(value * 10) / 10;

export const hoursBetween = (from: Date, to: Date) => round1(Math.max(0, to.getTime() - from.getTime()) / HOUR);

export function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return round1(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
}

export interface Reviewed { submittedAt: Date | null; gradedAt: Date | null }

/** Oldest waiting item + median submitted→graded time for the reviewed items. */
export function summariseBacklog(waiting: readonly (Date | null)[], reviewed: readonly Reviewed[], now: Date) {
  const pending = waiting.filter((at): at is Date => at !== null);
  const oldest = pending.length ? new Date(Math.min(...pending.map(at => at.getTime()))) : null;
  const turnaround = reviewed.flatMap(r => (r.submittedAt && r.gradedAt ? [hoursBetween(r.submittedAt, r.gradedAt)] : []));
  return {
    oldestSubmittedAt: oldest,
    oldestWaitingHours: oldest ? hoursBetween(oldest, now) : null,
    medianTurnaroundHours: median(turnaround),
    gradedLast30Days: turnaround.length,
  };
}
