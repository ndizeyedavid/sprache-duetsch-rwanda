import { describe,expect,it } from 'vitest';
import { parseInstallments } from './installment-utils';
describe('staff instalment editor', () => {
  it('keeps the default single payment when no schedule is entered', () => { expect(parseInstallments([], 200)).toEqual({ installments: undefined, error: null }); });
  it('validates the full tuition amount', () => {
    expect(parseInstallments([{ amount: '100', dueDate: '2026-10-06' }, { amount: '100', dueDate: '2026-11-06' }], 200).error).toBeNull();
    expect(parseInstallments([{ amount: '100', dueDate: '2026-10-06' }], 200).error).toBeTruthy();
  });
  it('rejects missing dates, invalid amounts and reversed deadlines', () => {
    for (const rows of [[{ amount: '100', dueDate: '' }], [{ amount: 'bad', dueDate: '2026-10-06' }], [{ amount: '50', dueDate: '2026-11-06' }, { amount: '50', dueDate: '2026-10-06' }]]) expect(parseInstallments(rows, 100).error).toBeTruthy();
  });
  it('compares currency cents without floating-point sum errors', () => { expect(parseInstallments([{ amount: '0.1', dueDate: '2026-10-06' }, { amount: '0.2', dueDate: '2026-11-06' }], 0.3).error).toBeNull(); });
});
