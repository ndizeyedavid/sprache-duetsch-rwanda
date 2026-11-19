import { apiGet, apiPost } from './api';

/** One mobile-money payment request (XendlyPay). Older rows from the retired Paypack integration have provider "PAYPACK". */
export interface PaymentCheckout {
  id: string;
  amount: string;
  currency: string;
  phone: string;
  requestKey: string;
  status: 'INITIATING' | 'PENDING' | 'UNKNOWN' | 'SUCCESSFUL' | 'FAILED';
  provider: string;
  providerRef: string | null;
  failureReason: string | null;
  paymentId: string | null;
  createdAt: string;
  student?: { studentCode: string; user: { firstName: string; lastName: string } };
}
export interface MobileMoneyConfig { enabled: boolean; minimumAmount: number; currency?: string; testMode?: boolean }
export const GATEWAY_METHOD_CODE = 'XENDLYPAY';
export const isUnresolved = (row: PaymentCheckout) => row.provider === 'XENDLYPAY' && ['INITIATING', 'PENDING', 'UNKNOWN'].includes(row.status);
const base = '/payments/mobile-money';
export const getMobileMoneyConfig = () => apiGet<MobileMoneyConfig>(`${base}/config`);
export const listMyCheckouts = () => apiGet<PaymentCheckout[]>(`${base}/me`);
export const listMobileMoneyCheckouts = () => apiGet<PaymentCheckout[]>(base);
export const checkPayment = (id: string) => apiGet<PaymentCheckout>(`${base}/${id}`);
export const startPayment = (body: { amount: number; phone: string; requestKey: string }) =>
  apiPost<PaymentCheckout>(`${base}/checkout`, body);
/** Where a checkout hook loads, starts and checks payments: the signed-in student or a public invoice link. */
export interface MobileMoneyClient {
  list: () => Promise<PaymentCheckout[]>;
  check: (id: string) => Promise<PaymentCheckout>;
  start: (body: { amount: number; phone: string; requestKey: string }) => Promise<PaymentCheckout>;
}
export const studentMobileMoneyClient: MobileMoneyClient = { list: listMyCheckouts, check: checkPayment, start: startPayment };
/** Finance: link an unclear request to the XendlyPay payment id found in the XendlyPay dashboard. */
export const reconcilePayment = (id: string, reference: string, reason: string) =>
  apiPost<PaymentCheckout>(`${base}/${id}/reconcile`, { reference, reason });
export const closeUnsubmittedPayment = (id: string, reason: string) =>
  apiPost<PaymentCheckout>(`${base}/${id}/close`, { confirmedNoDebit: true, reason });
