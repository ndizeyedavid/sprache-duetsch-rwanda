import type { Money } from './money';
export type FinanceDashboard = {
  currency: string;
  outstandingBasis?: string;
  totalBilled: Money;
  totalCollected: Money;
  totalOutstanding: Money;
  collectionRate: number;
  overdueCount: number;
  byLevel: { key: string; billed: Money; collected: Money }[];
  byIntake: { key: string; billed: Money; collected: Money }[];
  byCampus: { key: string; billed: Money; collected: Money }[];
  byPaymentMethod: { methodId: string; name: string | null; total: Money }[];
};
