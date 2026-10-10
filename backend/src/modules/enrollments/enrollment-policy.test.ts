import { describe,expect,it } from 'vitest';
import type { Prisma } from '../../generated/prisma/client.js';
import { assertSingleActiveLevel,validateIntakeDates } from './enrollment-policy.js';
it('rejects merged invalid intake dates and invalid enrolment windows', () => {
  expect(() => validateIntakeDates({ startDate: new Date('2026-10-01'), endDate: new Date('2026-09-01') })).toThrow();
  expect(() => validateIntakeDates({ startDate: new Date('2026-10-01'), endDate: new Date('2026-12-01'), enrollmentOpensAt: new Date('2026-10-02'), enrollmentEndsAt: new Date('2026-10-01') })).toThrow();
});

describe('one active enrolment per level', () => {
  const txWith = (found: unknown, seen: unknown[] = []) => ({
    enrollment: { findFirst: (args: unknown) => { seen.push(args); return Promise.resolve(found); } },
  }) as unknown as Prisma.TransactionClient;

  it('refuses a second active enrolment in the same level', async () => {
    const tx = txWith({ level: { code: 'A1' }, intake: { name: 'Intake 09 / 2026' } });
    await expect(assertSingleActiveLevel(tx, { studentId: 's', levelId: 'A1' })).rejects.toThrow(/Already actively enrolled in A1 \(Intake 09 \/ 2026\)/);
  });

  it('allows a first or repeat enrolment and ignores the enrolment being edited', async () => {
    const seen: unknown[] = [];
    await expect(assertSingleActiveLevel(txWith(null, seen), { studentId: 's', levelId: 'A1', enrollmentId: 'e1' })).resolves.toBeUndefined();
    expect(seen[0]).toMatchObject({ where: { studentId: 's', levelId: 'A1', status: 'ACTIVE', id: { not: 'e1' } } });
  });
});
