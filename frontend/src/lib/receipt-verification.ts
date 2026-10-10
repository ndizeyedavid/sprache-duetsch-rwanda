import { apiGet } from './api';

export type ReceiptVerification = {
  valid: boolean; receiptNumber: string; payerName: string; amount: string; currency: string;
  paidAt: string; issuedAt: string; method: string; course: string | null; voidedAt: string | null;
};

export const verifyReceipt = (id: string) => apiGet<ReceiptVerification>(`/receipts/verify/${encodeURIComponent(id)}`);
