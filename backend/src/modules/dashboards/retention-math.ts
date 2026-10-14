/** Pure retention math over enrolment status counts. */
export interface StatusCounts { enrolled: number; active: number; completed: number; withdrawn: number; deferred: number }

export const emptyCounts = (): StatusCounts => ({ enrolled: 0, active: 0, completed: 0, withdrawn: 0, deferred: 0 });

const STATUS_KEY = { ACTIVE: "active", COMPLETED: "completed", WITHDRAWN: "withdrawn", DEFERRED: "deferred" } as const;

export function addStatus(counts: StatusCounts, status: keyof typeof STATUS_KEY, count: number): StatusCounts {
  counts.enrolled += count;
  counts[STATUS_KEY[status]] += count;
  return counts;
}

const rate = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 10000) / 100 : null);

/**
 * Retention = enrolments not withdrawn (active, completed or deferred) / all enrolments.
 * Completion = completed / all enrolments. Both null when nothing is enrolled.
 */
export const withRates = (counts: StatusCounts) => ({
  ...counts,
  retentionRate: rate(counts.enrolled - counts.withdrawn, counts.enrolled),
  completionRate: rate(counts.completed, counts.enrolled),
});
