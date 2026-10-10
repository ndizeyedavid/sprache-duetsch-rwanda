import { apiGet } from '.././api';
import type { ReceiptRow } from './receipt-row';
export function getMyReceipts(): Promise<ReceiptRow[]> {
  return apiGet<ReceiptRow[]>('/payments/me/receipts?pageSize=50');
}
