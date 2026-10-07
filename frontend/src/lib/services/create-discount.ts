import { apiPost } from '.././api';
import type { DiscountRow } from './discount-row';
export function createDiscount(body: Record<string, unknown>): Promise<DiscountRow> {
  return apiPost<DiscountRow>('/payments/discounts', body);
}
