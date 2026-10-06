import { expect,it } from 'vitest';
import { validateIntakeDates } from './enrollment-policy.js';
it('rejects merged invalid intake dates and invalid enrolment windows', () => {
  expect(() => validateIntakeDates({ startDate: new Date('2026-10-01'), endDate: new Date('2026-09-01') })).toThrow();
  expect(() => validateIntakeDates({ startDate: new Date('2026-10-01'), endDate: new Date('2026-12-01'), enrollmentOpensAt: new Date('2026-10-02'), enrollmentEndsAt: new Date('2026-10-01') })).toThrow();
});
