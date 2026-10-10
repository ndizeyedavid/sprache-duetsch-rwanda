import { apiPost } from '.././api';
export function approveDiscount(id: string): Promise<unknown> {
  return apiPost(`/payments/discounts/${id}/approve`, {});
}
