import { money } from '../../../lib/services/money';
import type { StudentRow } from '../../../lib/services/student-row';

export type BalanceInfo = { balance: number; due: number; paid: number; overdue: number; nextDue: number; currency: string; status: string };

/** Money view of a student row; null when the viewer may not see money. */
export function balanceOf(row: Pick<StudentRow, 'finance'>): BalanceInfo | null {
  const f = row.finance;
  if (!f || f.balance === undefined) return null;
  return {
    balance: Math.max(0, money(f.balance)), due: money(f.totalDue) - money(f.totalDiscount), paid: money(f.totalPaid),
    overdue: money(f.overdueAmount), nextDue: money(f.nextDueAmount), currency: f.currency, status: f.status ?? 'UNPAID',
  };
}

export type AmountOption = { label: string; amount: number };

/** One-tap amounts: the whole balance, the overdue part, the next instalment and half — deduplicated. */
export function amountOptions(info: BalanceInfo): AmountOption[] {
  const raw: AmountOption[] = [
    { label: 'Full balance', amount: info.balance },
    { label: 'Overdue', amount: info.overdue },
    { label: 'Next instalment', amount: info.nextDue },
    { label: 'Half', amount: Math.round(info.balance / 2) },
  ];
  const seen = new Set<number>();
  return raw.filter((o) => o.amount > 0 && o.amount <= info.balance && !seen.has(o.amount) && seen.add(o.amount));
}

export type BalanceFilter = 'all' | 'owing' | 'overdue' | 'paid';

export function matchesBalance(info: BalanceInfo | null, filter: BalanceFilter): boolean {
  if (filter === 'all' || !info) return filter === 'all';
  if (filter === 'owing') return info.balance > 0;
  if (filter === 'overdue') return info.overdue > 0;
  return info.balance <= 0;
}
