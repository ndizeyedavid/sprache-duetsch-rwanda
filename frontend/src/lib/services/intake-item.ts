import type { Money } from './money';
export type IntakeItem = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  enrollmentOpensAt: string | null;
  enrollmentEndsAt: string | null;
  registrationFee: Money;
  bookFee: Money;
  currency: string;
  isActive: boolean;
  createdAt: string;
  /** Only returned by GET /intakes/:id. */
  _count?: { enrollments: number; classes: number };
};
