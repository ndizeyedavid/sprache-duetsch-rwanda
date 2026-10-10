import { describe,expect,it } from 'vitest';
import { Prisma } from '../generated/prisma/client.js';
import { allocateObligations,assertCurrency } from './finance-policy.js';
const now = new Date('2026-10-05T00:00:00Z');
const charge = (id: string, amount: number, due: string | null) => ({ id, amount: new Prisma.Decimal(amount), dueDate: due ? new Date(due) : null, createdAt: new Date('2026-09-01T00:00:00Z') });
describe('dated financial obligations', () => {
  it('does not call a covered old charge overdue', () => {
    const result = allocateObligations([charge('old', 100, '2026-10-01'), charge('future', 100, '2026-11-01')], new Prisma.Decimal(100), now);
    expect(result.overdueAmount.toString()).toBe('0'); expect(result.nextDueAmount.toString()).toBe('100');
  });
  it('allocates partial payments oldest first and detects time passing', () => {
    const rows = [charge('one', 100, '2026-10-06'), charge('two', 100, '2026-11-01')];
    expect(allocateObligations(rows, new Prisma.Decimal(40), now).overdueAmount.toString()).toBe('0');
    expect(allocateObligations(rows, new Prisma.Decimal(40), new Date('2026-10-07')).overdueAmount.toString()).toBe('60');
  });
  it('keeps excess payment as credit rather than a negative obligation', () => {
    expect(allocateObligations([charge('a', 100, null)], new Prisma.Decimal(150), now).obligations[0].outstanding.toString()).toBe('0');
  });
  it('rejects mixed currencies', () => { expect(() => assertCurrency(['RWF'], 'USD')).toThrow(); expect(assertCurrency(['rwf'], 'RWF')).toBe('RWF'); });
});
