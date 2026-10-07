import { apiGet } from '.././api';
import type { PaymentMethod } from './payment-method';
export function listPaymentMethods(): Promise<PaymentMethod[]> {
  return apiGet<PaymentMethod[]>('/payments/methods');
}
