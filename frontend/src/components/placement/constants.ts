import type { PlacementStatus } from '../../lib/services/placement-types';

export const STATUS_LABEL: Record<PlacementStatus, string> = {
  UNAVAILABLE: 'Not available yet',
  NOT_TAKEN: 'Not taken',
  IN_PROGRESS: 'In progress',
  AWAITING_DECISION: 'Awaiting confirmation',
  CONFIRMED: 'Level confirmed',
};

export const STATUS_BADGE: Record<PlacementStatus, string> = {
  UNAVAILABLE: 'badge-ghost',
  NOT_TAKEN: 'badge-info',
  IN_PROGRESS: 'badge-warning',
  AWAITING_DECISION: 'badge-warning',
  CONFIRMED: 'badge-success',
};

export const SOURCE_LABEL = { TEST: 'Online test', MANUAL: 'Staff entry' } as const;

/** Autosave debounce while answering (ms). */
export const AUTOSAVE_DELAY = 800;
