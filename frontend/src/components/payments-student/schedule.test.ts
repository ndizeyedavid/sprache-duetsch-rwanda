import { describe,expect,it } from 'vitest';
import type { MyFinanceDetail } from '../../lib/student-payments';
import { daysUntil,dueInWords,obligationLabel,scheduleRows } from './schedule';

type Charge = MyFinanceDetail['charges'][number];

const charge = (over: Partial<Charge>): Charge => ({
  id: 'c', type: 'TUITION', amount: '45000', currency: 'RWF', createdAt: '2026-09-01T00:00:00Z', ...over,
});

const now = new Date('2026-10-11T09:00:00Z');

describe('scheduleRows', () => {
  it('uses the API allocation and orders by due date, undated last', () => {
    const rows = scheduleRows([
      charge({ id: 'late', description: 'Installment 2', dueAt: '2026-11-01T00:00:00Z', outstanding: '20000', amount: '20000', obligationStatus: 'UPCOMING' }),
      charge({ id: 'none', type: 'BOOKS', amount: '5000', outstanding: '5000' }),
      charge({ id: 'first', description: 'Installment 1', dueAt: '2026-10-01T00:00:00Z', outstanding: '5000', amount: '25000', obligationStatus: 'OVERDUE' }),
    ], now);
    expect(rows.map(r => r.id)).toEqual(['first', 'late', 'none']);
    expect(rows[0]).toMatchObject({ amount: 25000, paid: 20000, remaining: 5000, status: 'OVERDUE' });
    expect(rows[2]).toMatchObject({ description: 'Books', status: 'UPCOMING' });
  });

  it('derives a status when the API does not send one', () => {
    const [paid] = scheduleRows([charge({ outstanding: '0', dueDate: '2026-10-01T00:00:00Z' })], now);
    const [overdue] = scheduleRows([charge({ outstanding: '45000', dueDate: '2026-10-01T00:00:00Z' })], now);
    const [partial] = scheduleRows([charge({ outstanding: '10000', dueDate: '2026-12-01T00:00:00Z' })], now);
    expect([paid.status, overdue.status, partial.status]).toEqual(['PAID', 'OVERDUE', 'PARTIALLY_PAID']);
  });

  it('never reports negative money', () => {
    const [row] = scheduleRows([charge({ outstanding: '-500' })], now);
    expect(row.remaining).toBe(0);
    expect(row.paid).toBe(45000);
  });
});

describe('due wording', () => {
  it('counts calendar days', () => {
    expect(daysUntil('2026-10-11T23:00:00', new Date('2026-10-11T08:00:00'))).toBe(0);
    expect(dueInWords('2026-10-12T08:00:00', new Date('2026-10-11T20:00:00'))).toBe('due tomorrow');
    expect(dueInWords('2026-10-19T08:00:00', new Date('2026-10-11T08:00:00'))).toBe('due in 8 days');
    expect(dueInWords('2026-10-08T08:00:00', new Date('2026-10-11T08:00:00'))).toBe('3 days late');
  });

  it('uses the closed payment-status labels', () => {
    expect(obligationLabel('PARTIALLY_PAID')).toBe('Partially Paid');
    expect(obligationLabel('PAID')).toBe('Fully Paid');
  });
});
