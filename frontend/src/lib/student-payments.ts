import { apiGet } from './api';
import type { Money } from './services/money';
import type { MyFinance } from './services/my-finance';
import type { PaymentMethod } from './services/payment-method';

/** A recorded payment (cash, bank, MoMo, card or a settled Paypack request) with its receipt. */
export type MyPaymentRow = MyFinance['payments'][number] & {
  receipt?: { id: string; receiptNumber: string; voidedAt?: string | null } | null;
};

/** `GET /payments/me/finance` with the fields the full Payments page reads. */
export type MyFinanceDetail = Omit<MyFinance, 'finance' | 'payments'> & {
  finance: (NonNullable<MyFinance['finance']> & { totalDiscount?: Money; lastPaymentAt?: string | null }) | null;
  payments: MyPaymentRow[];
};

export function getMyFinanceDetail(): Promise<MyFinanceDetail> {
  return apiGet<MyFinanceDetail>('/payments/me/finance');
}

/** Ways to pay that finance has switched on, each with its own instructions (account, pay code…). */
export function listActivePaymentMethods(): Promise<PaymentMethod[]> {
  return apiGet<PaymentMethod[]>('/payments/methods?isActive=true');
}
