import { money } from '../../lib/services/money';
import type { MyFinanceDetail } from '../../lib/student-payments';

export type ObligationStatus = 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'UPCOMING';

export type ScheduleRow = {
  id: string;
  description: string;
  dueAt: string | null;
  amount: number;
  paid: number;
  remaining: number;
  currency: string;
  status: ObligationStatus;
};

/** Labels match the closed payment-status set so StatusBadge colours them consistently. */
const LABELS: Record<ObligationStatus, string> = {
  PAID: 'Fully Paid',
  PARTIALLY_PAID: 'Partially Paid',
  OVERDUE: 'Overdue',
  UPCOMING: 'Upcoming',
};

export function obligationLabel(status: ObligationStatus): string {
  return LABELS[status];
}

const isStatus = (value: unknown): value is ObligationStatus => typeof value === 'string' && value in LABELS;

const CHARGE_NAMES: Record<string, string> = {
  TUITION: 'Course tuition', REGISTRATION: 'Registration fee', BOOKS: 'Books', MATERIALS: 'Learning materials', OTHER: 'Other fee',
};

type Charge = MyFinanceDetail['charges'][number];

function statusOf(charge: Charge, remaining: number, amount: number, dueAt: string | null, now: Date): ObligationStatus {
  // The API allocates payments oldest-due-first; trust its status, derive only as a fallback.
  if (isStatus(charge.obligationStatus)) return charge.obligationStatus;
  if (remaining <= 0) return 'PAID';
  if (dueAt && new Date(dueAt).getTime() < now.getTime()) return 'OVERDUE';
  return remaining < amount ? 'PARTIALLY_PAID' : 'UPCOMING';
}

/** Every charge/installment as a schedule line, earliest due date first (undated last). */
export function scheduleRows(charges: Charge[], now: Date = new Date()): ScheduleRow[] {
  return charges
    .map(charge => {
      const amount = money(charge.amount);
      const remaining = Math.max(0, charge.outstanding === undefined ? amount : money(charge.outstanding));
      const dueAt = charge.dueAt ?? charge.dueDate ?? null;
      return {
        id: charge.id,
        description: charge.description?.trim() || CHARGE_NAMES[charge.type] || 'Fee',
        dueAt,
        amount,
        paid: Math.max(0, amount - remaining),
        remaining,
        currency: charge.currency,
        status: statusOf(charge, remaining, amount, dueAt, now),
      };
    })
    .sort((a, b) => {
      if (a.dueAt === b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    });
}

/** Whole days from `now` until `iso` (negative when past). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const due = new Date(iso);
  const end = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
  return Math.round((end - start) / 86_400_000);
}

export function dueInWords(iso: string, now: Date = new Date()): string {
  const days = daysUntil(iso, now);
  if (days === 0) return 'due today';
  if (days === 1) return 'due tomorrow';
  if (days > 1) return `due in ${days} days`;
  return days === -1 ? '1 day late' : `${-days} days late`;
}
