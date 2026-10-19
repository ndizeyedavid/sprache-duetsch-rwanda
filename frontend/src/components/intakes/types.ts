import type { IntakeItem } from '../../lib/services';

/** Where an intake sits in time; derived from its dates (see `intakePhase`). */
export type IntakePhase = 'Upcoming' | 'Running' | 'Ended';

/** Registration filter on the intake list: the switch staff flip, plus archived intakes. */
export type RegistrationFilter = 'All' | 'Open' | 'Closed' | 'Archived';

/** Form state for `IntakeForm` — dates are `yyyy-mm-dd` for `<input type="date">`. */
export type IntakeDraft = {
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  registrationOpen: boolean;
};

export type PhaseFields = Pick<IntakeItem, 'startDate' | 'endDate'>;
export type RegistrationFields = Pick<IntakeItem, 'isActive' | 'registrationOpen' | 'endDate'>;
