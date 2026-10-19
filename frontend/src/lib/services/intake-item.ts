import type { Money } from './money';
export type IntakeItem = {
  levels?: { id: string; code: string; title: string; isActive: boolean }[];
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  /** Registration switch: students can register while this is on and the intake has not ended. */
  registrationOpen: boolean;
  registrationFee: Money;
  bookFee: Money;
  currency: string;
  isActive: boolean;
  createdAt: string;
  /** Only returned by GET /intakes/:id. */
  _count?: { enrollments: number; classes: number };
};
