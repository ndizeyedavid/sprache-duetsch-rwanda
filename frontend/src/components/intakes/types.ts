import type { IntakeItem } from '../../lib/services';

/**
 * Where an intake sits relative to today. The API stores no status for an
 * intake, so this is derived from the dates (see `intakePhase`).
 */
export type IntakePhase = 'Upcoming' | 'Enrolling' | 'Running' | 'Ended';

export const PHASES: readonly IntakePhase[] = ['Upcoming', 'Enrolling', 'Running', 'Ended'];

/** Form state for `IntakeForm` — dates are `yyyy-mm-dd` for `<input type="date">`. */
export type IntakeDraft = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  enrollmentOpensAt: string;
  enrollmentEndsAt: string;
  registrationFee: string;
  bookFee: string;
  currency: string;
  isActive: boolean;
};

export type PhaseFields = Pick<
  IntakeItem,
  'startDate' | 'endDate' | 'enrollmentOpensAt' | 'enrollmentEndsAt'
>;
