import { describe,expect,it } from 'vitest';
import { isScopedPath } from './scoped-paths';

describe('isScopedPath', () => {
  it('scopes staff lists and dashboards', () => {
    expect(isScopedPath('/payments')).toBe(true);
    expect(isScopedPath('payments/charges')).toBe(true);
    expect(isScopedPath('/dashboards/finance')).toBe(true);
    expect(isScopedPath('/students/export')).toBe(true);
    expect(isScopedPath('/payments/reports/summary')).toBe(true);
    expect(isScopedPath('/assessments/attempts/export')).toBe(true);
    expect(isScopedPath('/dashboards/at-risk')).toBe(true);
  });
  it('never scopes reference data, detail views or self-service', () => {
    expect(isScopedPath('/intakes')).toBe(false);
    expect(isScopedPath('/intakes/overview')).toBe(false);
    expect(isScopedPath('/students/abc-123')).toBe(false);
    expect(isScopedPath('/payments/my')).toBe(false);
    expect(isScopedPath('/dashboards/student')).toBe(false);
    expect(isScopedPath('/assignments/my')).toBe(false);
    expect(isScopedPath('/payments/methods')).toBe(false);
  });
});
