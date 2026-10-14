import type { ApplicationSource,ApplicationStatus,Shift } from '../../lib/admissions-types';
import type { Tone } from '../../types';

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  NEW: 'New',
  REVIEWING: 'Reviewing',
  ACCEPTED: 'Accepted',
  WAITLISTED: 'Waitlisted',
  REJECTED: 'Rejected',
  ENROLLED: 'Enrolled',
  WITHDRAWN: 'Withdrawn',
};

export const STATUS_TONE: Record<ApplicationStatus, Tone> = {
  NEW: 'navy',
  REVIEWING: 'sun',
  ACCEPTED: 'brand',
  WAITLISTED: 'sun',
  REJECTED: 'coral',
  ENROLLED: 'brand',
  WITHDRAWN: 'muted',
};

/** Queue tabs, in pipeline order. "Waitlist" shows the grouped, ranked board. */
export const QUEUE_TABS: { status: ApplicationStatus; label: string }[] = [
  { status: 'NEW', label: 'New' },
  { status: 'REVIEWING', label: 'Reviewing' },
  { status: 'ACCEPTED', label: 'Accepted' },
  { status: 'WAITLISTED', label: 'Waitlist' },
  { status: 'REJECTED', label: 'Rejected' },
  { status: 'ENROLLED', label: 'Enrolled' },
  { status: 'WITHDRAWN', label: 'Withdrawn' },
];

/** Button wording for each target status in the review drawer. */
export const ACTION_LABEL: Record<ApplicationStatus, string> = {
  NEW: 'Reopen',
  REVIEWING: 'Start review',
  ACCEPTED: 'Accept',
  WAITLISTED: 'Waitlist',
  REJECTED: 'Reject',
  ENROLLED: 'Mark enrolled',
  WITHDRAWN: 'Withdraw',
};

export const ACTION_STYLE: Partial<Record<ApplicationStatus, string>> = {
  ACCEPTED: 'border-0 bg-brand text-white hover:bg-night',
  ENROLLED: 'border-0 bg-brand text-white hover:bg-night',
  REJECTED: 'btn-outline btn-error',
};

export const SOURCE_LABEL: Record<ApplicationSource, string> = {
  WEBSITE: 'Website',
  CATALOG: 'Catalogue',
  PORTAL: 'Portal',
  WALK_IN: 'Walk-in',
};

export const SHIFT_LABEL: Record<Shift, string> = {
  MORNING: 'Morning',
  AFTERNOON: 'Afternoon',
  EVENING: 'Evening',
  WEEKEND: 'Weekend',
};

export const PAGE_SIZE = 20;

export const FIELD = 'input input-sm w-full rounded-field border-line bg-base-200';
export const SELECT = 'select select-sm w-full rounded-field border-line bg-base-200';
