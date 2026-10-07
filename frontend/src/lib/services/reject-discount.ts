import { apiPost } from '.././api';
export function rejectDiscount(id: string, reason: string): Promise<unknown> {
  return apiPost(`/payments/discounts/${id}/reject`, { reason });
}
