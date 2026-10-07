import { apiGet } from '.././api';
import type { MyFinance } from './my-finance';
export function getMyFinance(): Promise<MyFinance> {
  return apiGet<MyFinance>('/payments/me/finance');
}
