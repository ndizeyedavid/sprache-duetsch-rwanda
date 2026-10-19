import { describe,expect,it } from 'vitest';
import { amountOptions,balanceOf,matchesBalance } from './quick-pay';

const row = (f: Record<string, unknown> | null) => ({ finance: f as never });

describe('quick pay helpers', () => {
  const info = balanceOf(row({ currency: 'RWF', balance: '45000', totalDue: '90000', totalDiscount: '0', totalPaid: '45000', overdueAmount: '45000', nextDueAmount: '20000', status: 'OVERDUE' }))!;
  it('reads the money profile', () => {
    expect(info).toMatchObject({ balance: 45000, due: 90000, paid: 45000, overdue: 45000, nextDue: 20000 });
    expect(balanceOf(row({ currency: 'RWF' }))).toBeNull();
  });
  it('offers distinct one-tap amounts within the balance', () => {
    expect(amountOptions(info).map((o) => [o.label, o.amount])).toEqual([['Full balance', 45000], ['Next instalment', 20000], ['Half', 22500]]);
  });
  it('filters owing / overdue / paid', () => {
    expect(matchesBalance(info, 'owing')).toBe(true);
    expect(matchesBalance(info, 'paid')).toBe(false);
    expect(matchesBalance({ ...info, balance: 0, overdue: 0 }, 'paid')).toBe(true);
  });
});
