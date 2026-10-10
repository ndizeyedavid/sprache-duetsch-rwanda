import type { TeachingFilters } from './types';

export const EMPTY_TEACHING_FILTERS: TeachingFilters = {
  query: '',
  levelId: '',
  teacherStatus: '',
};

export const TEACHER_STATUS_FILTERS = [
  { value: '', label: 'All teacher accounts' },
  { value: 'ACTIVE', label: 'Active only' },
  { value: 'inactive', label: 'Inactive only' },
] as const;

/** Shared shape for the toolbar selects — one row that wraps to two on phones. */
export const selectField =
  'select select-sm min-w-0 flex-1 rounded-full border-line bg-base-100 text-xs sm:max-w-44 sm:flex-none';

/**
 * Solid status inks. `sun-soft` and `coral-soft` are fixed pale tints that do not
 * change per theme, so each ink is a darkened companion that clears AA on that
 * tint in every theme — the same rule `lib/status.ts` follows.
 */
export const SUN_SOFT = 'bg-sun-soft';
export const SUN_INK = 'text-[#6B5200]';
export const CORAL_SOFT = 'bg-coral-soft';
export const CORAL_INK = 'text-[#AE3522]';

/** Both halves together, for surfaces that need one background + one ink. */
export const SUN_BADGE = `${SUN_SOFT} ${SUN_INK}`;
export const CORAL_BADGE = `${CORAL_SOFT} ${CORAL_INK}`;