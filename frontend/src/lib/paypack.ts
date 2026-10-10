import { apiGet, apiPost } from './api';

export interface PaymentCheckout {
  id: string;
  amount: string;
  currency: string;
  phone: string;
  requestKey: string;
  status: 'INITIATING' | 'PENDING' | 'UNKNOWN' | 'SUCCESSFUL' | 'FAILED';
  providerRef: string | null;
  paymentId: string | null;
  createdAt: string;
  student?: { studentCode: string; user: { firstName: string; lastName: string } };
}
export const isUnresolved = (row: PaymentCheckout) => ['INITIATING', 'PENDING', 'UNKNOWN'].includes(row.status);
export const getPaypackConfig = () => apiGet<{ enabled: boolean; minimumAmount: number; currency: string }>('/payments/paypack/config');
export const listMyCheckouts = () => apiGet<PaymentCheckout[]>('/payments/paypack/me');
export const listPaypackCheckouts = () => apiGet<PaymentCheckout[]>('/payments/paypack');
export const checkPayment = (id: string) => apiGet<PaymentCheckout>(`/payments/paypack/${id}`);
export const startPayment = (body: { amount: number; phone: string; requestKey: string }) =>
  apiPost<PaymentCheckout>('/payments/paypack/checkout', body);
export const reconcilePayment = (id: string, reference: string, reason: string) =>
  apiPost<PaymentCheckout>(`/payments/paypack/${id}/reconcile`, { reference, reason });
export const closeUnsubmittedPayment = (id: string, reason: string) =>
  apiPost<PaymentCheckout>(`/payments/paypack/${id}/close`, { confirmedNoDebit: true, reason });
