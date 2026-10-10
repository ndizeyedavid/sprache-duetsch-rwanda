import { apiGet } from '.././api';
import type { DiscountRow } from './discount-row';
export function listDiscounts(status?: string): Promise<DiscountRow[]> {
  const query = status ? `?status=${status}&pageSize=100` : '?pageSize=100';
  return apiGet<DiscountRow[]>(`/payments/discounts${query}`);
}
