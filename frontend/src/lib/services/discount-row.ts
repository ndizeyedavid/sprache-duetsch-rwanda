import type { Money } from './money';
export type DiscountRow = {
  id: string;
  type: string;
  value: Money;
  reason: string;
  status: string;
  student: { studentCode: string; user: { firstName: string; lastName: string } };
};
