import type { AccountStatus,AttendanceStatus,CourseProgressStatus,LiveClassStatus,PaymentStatus,Tone } from '../types';

const STATUS_TONES: Record<string, Tone> = {
  Completed: 'brand',
  'On Progress': 'sun',
  'No Progress': 'coral',
  'Fully Paid': 'brand',
  'Partially Paid': 'sun',
  Unpaid: 'coral',
  Overdue: 'coral',
  Waived: 'navy',
  Refunded: 'muted',
  Active: 'brand',
  Deferred: 'sun',
  Inactive: 'muted',
  Pending: 'sun',
  Suspended: 'coral',
  Withdrawn: 'muted',
  Graduated: 'navy',
  Present: 'brand',
  Late: 'sun',
  Absent: 'coral',
  Excused: 'navy',
  Scheduled: 'navy',
  Live: 'coral',
  Cancelled: 'muted',
  Rescheduled: 'sun',
  // Intake lifecycle (derived from the intake dates, see components/intakes/utils.ts).
  Upcoming: 'navy',
  Enrolling: 'brand',
  Running: 'sun',
  Ended: 'muted',
};

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? 'muted';
}

/**
 * Tinted surfaces for status pills. The `brand`/`navy`/`muted` tones use
 * theme-aware `-soft`/`-ink` token pairs (see `index.css` `@theme`) so the
 * label keeps WCAG AA contrast on light *and* dark themes. `sun`/`coral` sit on
 * fixed pale backgrounds, so their darkened ink works in every theme.
 */
export const TONE_SURFACE: Record<Tone, string> = {
  brand: 'bg-brand-soft text-brand-soft-ink',
  sun: 'bg-sun-soft text-[#8A6800]',
  coral: 'bg-coral-soft text-[#AE3522]',
  navy: 'bg-night-soft text-night-soft-ink',
  muted: 'bg-muted-soft text-muted-ink',
};

export type { AccountStatus,AttendanceStatus,CourseProgressStatus,LiveClassStatus,PaymentStatus };
