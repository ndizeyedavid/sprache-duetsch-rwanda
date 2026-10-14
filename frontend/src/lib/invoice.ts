import { apiGet, apiPost } from './api';
import type { PaymentCheckout, PaypackClient } from './paypack';
import type { Money } from './services/money';

export type InvoiceLineStatus = 'PAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'UPCOMING';

/** Public invoice opened from the link in a balance-reminder email. */
export interface PublicInvoice {
  invoiceNumber: string;
  issuedAt: string;
  student: { name: string; studentCode: string; campus: string | null };
  summary: {
    totalDue: Money; totalDiscount: Money; totalPaid: Money; balance: Money; overdueAmount: Money;
    nextDueAmount: Money; nextDueAt: string | null; currency: string; status: string;
  } | null;
  lines: { id: string; description: string; type: string; amount: Money; outstanding: Money; dueAt: string | null; status: InvoiceLineStatus }[];
  paypack: { enabled: boolean; minimumAmount: number };
  checkouts: PaymentCheckout[];
}

const base = (token: string) => `/invoices/${encodeURIComponent(token)}`;
export const getInvoice = (token: string) => apiGet<PublicInvoice>(base(token));

/** Paypack calls scoped to the invoice link instead of the signed-in student. */
export const invoicePaypackClient = (token: string): PaypackClient => ({
  list: () => getInvoice(token).then(invoice => invoice.checkouts),
  check: id => apiGet<PaymentCheckout>(`${base(token)}/checkouts/${id}`),
  start: body => apiPost<PaymentCheckout>(`${base(token)}/pay`, body),
});
