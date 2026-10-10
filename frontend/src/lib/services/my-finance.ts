import type { Money } from './money';
export type MyFinance = {
  finance: { totalDue: Money; totalPaid: Money; balance: Money; status: string; currency: string; overdueAmount?: Money; nextDueAmount?: Money; nextDueAt?: string | null } | null;
  charges: { id: string; type: string; amount: Money; currency: string; createdAt: string; dueDate?: string | null; outstanding?: Money; obligationStatus?: string; dueAt?: string; description?: string }[];
  payments: {
    id: string;
    txnType?: "PAYMENT" | "REFUND";
    amount: Money;
    currency: string;
    reference: string | null;
    paidAt: string;
    method: { name: string } | null;
  }[];
  discounts: { id: string; amount: Money | null; status: string }[];
};
