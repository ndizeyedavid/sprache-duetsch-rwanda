import type { Money } from './money';
export type StudentCharge = {
  id: string;
  type: string;
  description: string;
  amount: Money;
  currency: string;
  dueDate: string | null;
  createdAt: string;
};
