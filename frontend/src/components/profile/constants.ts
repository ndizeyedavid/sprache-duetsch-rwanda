import type { Tone } from '../../types';

/** Profile views live in the URL (`?view=`) so a student can bookmark one. */
export const PROFILE_VIEWS = [
  { key: 'overview', label: 'Overview' },
  { key: 'payments', label: 'Payments' },
  { key: 'documents', label: 'Documents' },
] as const;

export type ProfileView = (typeof PROFILE_VIEWS)[number]['key'];

export const DEFAULT_VIEW: ProfileView = 'overview';

export function isProfileView(value: string | null): value is ProfileView {
  return PROFILE_VIEWS.some((view) => view.key === value);
}

/** Solid segment colour per attendance status — the same four the dashboard uses. */
export const ATTENDANCE_SLICES = [
  { key: 'present', label: 'Present', bar: 'bg-brand' },
  { key: 'late', label: 'Late', bar: 'bg-sun' },
  { key: 'absent', label: 'Absent', bar: 'bg-coral' },
  { key: 'excused', label: 'Excused', bar: 'bg-info' },
] as const;

export type AttendanceSliceKey = (typeof ATTENDANCE_SLICES)[number]['key'];

/** Below this the standing card says so out loud instead of hiding it in a number. */
export const ATTENDANCE_TARGET = 75;

const SKILL_BANDS: readonly { min: number; tone: Tone; hint: string }[] = [
  { min: 80, tone: 'brand', hint: 'Strong — keep it up in speaking practice.' },
  { min: 60, tone: 'sun', hint: 'Getting there — revise the grammar notes.' },
  { min: 0, tone: 'coral', hint: 'Needs work — book a practice slot with your teacher.' },
];

/** Skill bands drive the bar colour and the plain-language hint under it. */
export function skillBand(percentage: number): { tone: Tone; hint: string } {
  return SKILL_BANDS.find((band) => percentage >= band.min) ?? SKILL_BANDS[SKILL_BANDS.length - 1];
}

/** Ledger rows are capped so a long payment history cannot bury the summary. */
export const LEDGER_LIMIT = 8;

/**
 * Solid equivalents of `TONE_SURFACE`: same tones and the same darkened text,
 * but every background is a fully opaque token so nothing here relies on
 * half-opacity utilities.
 */
export const TONE_FLAT: Record<Tone, string> = {
  brand: 'bg-brand-soft text-[#B30A00]',
  sun: 'bg-sun-soft text-[#8A6800]',
  coral: 'bg-coral-soft text-[#D8482F]',
  navy: 'bg-base-200 text-night',
  muted: 'bg-base-200 text-[#5C5566]',
};
