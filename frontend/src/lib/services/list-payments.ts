import { apiGet } from '.././api';
import type { PaymentRow } from './payment-row';
export function listPayments(): Promise<PaymentRow[]> {
  return apiGet<PaymentRow[]>('/payments?pageSize=100');
}
