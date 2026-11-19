// What the enrolment register shows next to each enrolment: can the student actually open the course
// (account, enrolment status and tuition decide it, like loadStudentAccessProfile), and how far they got.
export type CourseAccess = "OPEN" | "UNPAID" | "SUSPENDED" | "CLOSED";

const BLOCKED_ACCOUNTS = ["SUSPENDED", "WITHDRAWN"];
const LIVE_ENROLMENTS = ["ACTIVE", "COMPLETED"];

/**
 * CLOSED: a withdrawn or deferred enrolment gives no access. SUSPENDED: the account is blocked.
 * OPEN: tuition for this enrolment is settled, so lessons and tests are unlocked. UNPAID: everything else.
 */
export function courseAccess(input: { enrollmentStatus: string; accountStatuses: string[]; paid: boolean }): CourseAccess {
  if (!LIVE_ENROLMENTS.includes(input.enrollmentStatus)) return "CLOSED";
  if (input.accountStatuses.some((status) => BLOCKED_ACCOUNTS.includes(status))) return "SUSPENDED";
  return input.paid ? "OPEN" : "UNPAID";
}

/** Completed published lessons per student and level, from (studentId, levelId) pairs of completed lessons. */
export function progressCounts(completed: { studentId: string; levelId: string }[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const row of completed) {
    const key = `${row.studentId}|${row.levelId}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
}

export const progressKey = (studentId: string, levelId: string) => `${studentId}|${levelId}`;
