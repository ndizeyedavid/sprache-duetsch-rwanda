import { describe,expect,it } from 'vitest';
import { coursePriceFields,hasFinancialFields,withoutFinancialFields } from './financial-visibility.js';
import { FINANCE_ROLES } from './roles.js';

describe('academic financial isolation', () => {
  it('permits catalogue price configuration without exposing transaction data', () => {
    expect(hasFinancialFields({ defaultFee: 1234, currency: 'RWF' }, coursePriceFields)).toBe(false);
    expect(hasFinancialFields({ balance: 1234 }, coursePriceFields)).toBe(true);
    expect(withoutFinancialFields({ defaultFee: '1234', currency: 'RWF', payments: [], finance: { balance: 10 } }, coursePriceFields))
      .toEqual({ defaultFee: '1234', currency: 'RWF' });
  });
  it('keeps finance access exclusive to finance and super administrators', () => {
    expect(FINANCE_ROLES).toEqual(['FINANCE_ADMIN', 'SUPER_ADMIN']);
  });
  it('removes nested money while retaining academic records and dates', () => {
    const date = new Date('2026-10-06T00:00:00Z');
    const data = { data: [{ id: 'student', finance: { balance: 50 }, enrollments: [
      { id: 'enrolment', totalFee: 200, charges: [{ amount: 200 }], level: { code: 'A1', defaultFee: 200, currency: 'RWF' }, enrolledAt: date },
    ] }] };
    expect(withoutFinancialFields(data)).toEqual({ data: [{ id: 'student', enrollments: [
      { id: 'enrolment', level: { code: 'A1' }, enrolledAt: date },
    ] }] });
  });
  it('blocks fee overrides and nested financial edits but allows academic changes', () => {
    expect(hasFinancialFields({ totalFee: 0 })).toBe(true);
    expect(hasFinancialFields({ installments: [{ amount: 50 }] })).toBe(true);
    expect(hasFinancialFields({ status: 'ACTIVE', classGroupId: 'class' })).toBe(false);
  });
  it('hides payment events and notifications without hiding academic activity', () => {
    expect(withoutFinancialFields({ data: [{ type: 'PAYMENT', body: 'Paid 100' }, { type: 'ENROLLMENT', title: 'Enrolled' }] }))
      .toEqual({ data: [{ type: 'ENROLLMENT', title: 'Enrolled' }] });
    expect(withoutFinancialFields({ type: 'PAYMENT', body: 'Paid 100' })).toBeNull();
  });
});
