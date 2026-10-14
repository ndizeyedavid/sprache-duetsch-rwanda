import type { ApplicationStatus } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";

/** Statuses that still hold a place in the admissions pipeline (used for de-duplication). */
export const OPEN_APPLICATION_STATUSES: ApplicationStatus[] = ["NEW", "REVIEWING", "ACCEPTED", "WAITLISTED"];

/** Decisions the applicant is told about by email (and in-app once they have an account). */
export const APPLICANT_NOTIFIED_STATUSES: ApplicationStatus[] = ["ACCEPTED", "WAITLISTED", "REJECTED"];

// The single source of truth for the admissions lifecycle.
const TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  NEW: ["REVIEWING", "WITHDRAWN"],
  REVIEWING: ["ACCEPTED", "WAITLISTED", "REJECTED", "WITHDRAWN"],
  WAITLISTED: ["ACCEPTED", "WITHDRAWN"],
  ACCEPTED: ["ENROLLED", "WITHDRAWN"],
  REJECTED: [],
  ENROLLED: [],
  WITHDRAWN: [],
};

const REASON_REQUIRED: ApplicationStatus[] = ["WAITLISTED", "REJECTED", "WITHDRAWN"];

export const nextStatuses = (from: ApplicationStatus): ApplicationStatus[] => TRANSITIONS[from];

export const requiresReason = (to: ApplicationStatus): boolean => REASON_REQUIRED.includes(to);

export const canTransition = (from: ApplicationStatus, to: ApplicationStatus): boolean =>
  TRANSITIONS[from].includes(to);

/** Allowed next steps with their reason rule, so the UI never re-implements the policy. */
export const transitionOptions = (from: ApplicationStatus) =>
  nextStatuses(from).map((status) => ({ status, reasonRequired: requiresReason(status) }));

export interface TransitionContext {
  studentLinked: boolean;
  /** Level and intake are set; waitlists are kept per level + intake. */
  courseChosen?: boolean;
  reason?: string | null;
}

/** Throws a 400 with a readable message when a status change is not allowed. */
export function assertTransition(from: ApplicationStatus, to: ApplicationStatus, context: TransitionContext): void {
  if (from === to) throw badRequest(`Application is already ${to.toLowerCase()}`);
  if (!canTransition(from, to)) throw badRequest(`An application cannot move from ${from} to ${to}`);
  if (to === "ENROLLED" && !context.studentLinked)
    throw badRequest("Create or link the student account before marking the application enrolled");
  if (to === "WAITLISTED" && !context.courseChosen) throw badRequest("Set the level and intake before waitlisting");
  if (requiresReason(to) && !context.reason?.trim()) throw badRequest("Give a reason for this decision");
}

export interface WaitlistCandidate {
  id: string;
  reference: string;
  levelId: string | null;
  intakeId: string | null;
  waitlistedAt: Date | null;
  createdAt: Date;
}

const queuedAt = (row: WaitlistCandidate): number => (row.waitlistedAt ?? row.createdAt).getTime();

/** First come, first served: earliest waitlisting wins, then earliest application, then reference. */
export function rankWaitlist<T extends WaitlistCandidate>(rows: T[]): (T & { position: number })[] {
  return [...rows]
    .sort((a, b) => queuedAt(a) - queuedAt(b) || a.createdAt.getTime() - b.createdAt.getTime() || a.reference.localeCompare(b.reference))
    .map((row, index) => ({ ...row, position: index + 1 }));
}

export const waitlistKey = (row: { levelId: string | null; intakeId: string | null }): string =>
  `${row.levelId ?? "-"}|${row.intakeId ?? "-"}`;

/** One ranked queue per level + intake, in the order each queue first appears. */
export function groupWaitlist<T extends WaitlistCandidate>(rows: T[]) {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const key = waitlistKey(row);
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  return [...groups.entries()].map(([key, members]) => ({
    key,
    levelId: members[0]?.levelId ?? null,
    intakeId: members[0]?.intakeId ?? null,
    entries: rankWaitlist(members),
  }));
}

/** Seats still free from class capacity; null when no class capacity is configured yet. */
export const seatsLeft = (capacity: number, occupied: number): number | null =>
  capacity > 0 ? Math.max(0, capacity - occupied) : null;
