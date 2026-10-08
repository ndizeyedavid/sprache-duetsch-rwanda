import { describe, expect, it } from 'vitest';
import { Prisma } from '../../generated/prisma/client.js';
import { receiptLines } from './receipt-lines.js';

const D = (n: number) => new Prisma.Decimal(n);
const charge = (id: string, type: 'TUITION' | 'BOOKS' | 'REGISTRATION', amount: number, day: number, description: string) =>
  ({ id, type, amount: D(amount), dueDate: null, createdAt: new Date(Date.UTC(2026, 9, day)), description });
const charges = [
  charge('t', 'TUITION', 45000, 1, 'Tuition — Deutsch A1 — Anfänger (INTAKE-2026-09)'),
  charge('b', 'BOOKS', 10000, 2, 'BOOKS — INTAKE-2026-09'),
  charge('r', 'REGISTRATION', 5000, 3, 'REGISTRATION — INTAKE-2026-09'),
];

describe('receiptLines', () => {
  it('splits one payment across every fee it pays off, oldest first', () => {
    expect(receiptLines(charges, D(0), D(60000))).toEqual([
      { title: 'Course fee', detail: 'Deutsch A1 — Anfänger (INTAKE-2026-09)', amount: 45000 },
      { title: 'Books', detail: 'INTAKE-2026-09', amount: 10000 },
      { title: 'Registration fee', detail: 'INTAKE-2026-09', amount: 5000 },
    ]);
  });
  it('starts after what earlier payments already covered and reports any extra as credit', () => {
    expect(receiptLines(charges, D(50000), D(15000))).toEqual([
      { title: 'Books', detail: 'INTAKE-2026-09', amount: 5000 },
      { title: 'Registration fee', detail: 'INTAKE-2026-09', amount: 5000 },
      { title: 'Credit kept on your account', detail: 'Used for your next fees', amount: 5000 },
    ]);
  });
});
