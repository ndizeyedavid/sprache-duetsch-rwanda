import { Prisma } from '../../generated/prisma/client.js';
import type { ChargeType } from '../../generated/prisma/client.js';
import { allocateObligations } from '../../lib/finance-policy.js';

export interface ReceiptLine { title: string; detail: string | null; amount: number }
interface ChargeRow { id: string; type: ChargeType; description: string; amount: Prisma.Decimal; dueDate: Date | null; createdAt: Date }

const TITLES: Record<ChargeType, string> = { TUITION: 'Course fee', REGISTRATION: 'Registration fee', BOOKS: 'Books', MATERIALS: 'Learning materials', OTHER: 'Other fee' };

/** "Tuition — Deutsch A1 — Anfänger (INTAKE-2026-09)" → "Deutsch A1 — Anfänger (INTAKE-2026-09)". */
function chargeDetail(charge: ChargeRow): string | null {
  const text = charge.description.replace(/^\s*(tuition|registration|books|materials|other)\s*[—–-]\s*/i, '').trim();
  return text && text.toUpperCase() !== charge.type ? text : null;
}

/**
 * What this payment paid off. Uses the same oldest-due-first rule as the account balance:
 * compare each fee's outstanding amount before and after the payment.
 */
export function receiptLines(charges: ChargeRow[], creditBefore: Prisma.Decimal, amount: Prisma.Decimal): ReceiptLine[] {
  const before = new Map(allocateObligations(charges, creditBefore).obligations.map(row => [row.id, row.outstanding]));
  const after = allocateObligations(charges, creditBefore.plus(amount)).obligations;
  const lines: ReceiptLine[] = [];
  let covered = new Prisma.Decimal(0);
  for (const row of after) {
    const paid = (before.get(row.id) ?? row.amount).minus(row.outstanding);
    if (paid.lessThanOrEqualTo(0)) continue;
    covered = covered.plus(paid);
    lines.push({ title: TITLES[row.type], detail: chargeDetail(row), amount: paid.toNumber() });
  }
  const extra = amount.minus(covered);
  if (extra.greaterThan(0)) lines.push({ title: 'Credit kept on your account', detail: 'Used for your next fees', amount: extra.toNumber() });
  return lines;
}
