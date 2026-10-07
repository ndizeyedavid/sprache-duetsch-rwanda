import type { Money } from './money';
export type ReceiptRow = {
  id: string;
  receiptNumber: string;
  issuedAt: string;
  payment: {
    amount: Money;
    currency: string;
    reference: string | null;
    paidAt: string;
    method: { name: string } | null;
  };
};
