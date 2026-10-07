import type { Money } from './money';
export type FinanceSummary = {
  currency: string;
  outstandingBasis?: string;
  totalBilled: Money;
  totalCollected: Money;
  totalOutstanding: Money;
  collectionRate: number;
  byMethod: { methodId: string; methodName: string | null; total: Money }[];
  byLevel: { key: string; label: string; billed: Money; collected: Money; outstanding: Money }[];
  byCampus: { key: string; label: string; billed: Money; collected: Money; outstanding: Money }[];
};
