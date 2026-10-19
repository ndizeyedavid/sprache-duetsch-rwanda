export const INTAKE_PHASES = ["UPCOMING", "ENROLLING", "RUNNING", "FINISHED", "ARCHIVED"] as const;
export type IntakePhase = (typeof INTAKE_PHASES)[number];

export interface IntakeWindow {
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  registrationOpen: boolean;
}

/**
 * Same rule as createEnrollment: students can register while staff keep registration open,
 * the intake is not archived and it has not ended yet.
 */
export const isEnrollmentOpen = (intake: IntakeWindow, now = new Date()): boolean =>
  intake.isActive && intake.registrationOpen && intake.endDate >= now;

/**
 * Lifecycle phase, first match wins:
 * - ARCHIVED  — `isActive` is false (disabled intakes, regardless of dates).
 * - FINISHED  — `endDate` is in the past.
 * - RUNNING   — `startDate` has passed (registration may still be open; see `enrollmentOpen`).
 * - ENROLLING — not started yet and registration is open.
 * - UPCOMING  — not started yet and registration is closed.
 */
export function intakePhase(intake: IntakeWindow, now = new Date()): IntakePhase {
  if (!intake.isActive) return "ARCHIVED";
  if (intake.endDate < now) return "FINISHED";
  if (intake.startDate <= now) return "RUNNING";
  return isEnrollmentOpen(intake, now) ? "ENROLLING" : "UPCOMING";
}
