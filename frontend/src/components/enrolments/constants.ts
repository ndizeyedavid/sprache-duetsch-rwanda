import type { EnrolmentFilters } from './types';

/** Closed set enforced by the API (`enrollmentStatusEnum`). */
export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active', hint: 'Counted in class rosters, assignment lists and announcements.' },
  { value: 'DEFERRED', label: 'Deferred', hint: 'On hold — the student resumes in a later intake.' },
  { value: 'COMPLETED', label: 'Completed', hint: 'Level finished. Keeps the study history and certificates.' },
  { value: 'WITHDRAWN', label: 'Withdrawn', hint: 'Student left the programme.' },
] as const;

export const STATUS_FILTERS = [
  { value: '', label: 'All statuses' },
  ...STATUS_OPTIONS.map((option) => ({ value: option.value, label: option.label })),
];

export const EMPTY_FILTERS: EnrolmentFilters = {
  query: '',
  levelId: '',
  intakeId: '',
  status: '',
  classGroupId: '',
  awaitingOnly: false,
};

export const FORM_HINT =
  'Places a registered student into a level, intake and class.';

export const ACTIVE_ONLY_NOTE =
  'Only ACTIVE enrolments appear in class rosters, assignment lists and announcements.';

export const REFUND_NOTE =
  'Refunds are recorded by finance under Transactions — withdrawing here does not refund charges.';

export const STUDENT_FIELD_ID = 'enrol-student';