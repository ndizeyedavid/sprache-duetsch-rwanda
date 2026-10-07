import type { Money } from './money';
export type PaymentRow = {
  id: string;
  txnType?: "PAYMENT" | "REFUND";
  refunds?: { id: string; amount: Money }[];
  amount: Money;
  currency: string;
  reference: string | null;
  paidAt: string;
  method: { name: string } | null;
  receipt: { id: string; receiptNumber: string; voidedAt?: string | null } | null;
  student: { studentCode: string; user: { firstName: string; lastName: string } };
};
