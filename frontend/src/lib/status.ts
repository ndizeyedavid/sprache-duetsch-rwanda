import type { AccountStatus, AttendanceStatus, CourseProgressStatus, LiveClassStatus, PaymentStatus, Tone } from '../types';

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
};

export function statusTone(status: string): Tone {
  return STATUS_TONES[status] ?? 'muted';
}

/**
 * Tinted surfaces for status pills. Text tones are darkened one step from the
 * mockup so the label passes WCAG AA contrast on its pale background.
 */
export const TONE_SURFACE: Record<Tone, string> = {
  brand: 'bg-brand-soft text-[#B30A00]',
  sun: 'bg-sun-soft text-[#8A6800]',
  coral: 'bg-coral-soft text-[#D8482F]',
  navy: 'bg-night/5 text-night',
  muted: 'bg-muted/10 text-[#6F6880]',
};

export type { AccountStatus, AttendanceStatus, CourseProgressStatus, LiveClassStatus, PaymentStatus };
