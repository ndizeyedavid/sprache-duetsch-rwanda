import { apiPost } from '.././api';
export function recordPayment(body: Record<string, unknown>): Promise<unknown> {
  return apiPost('/payments', body);
}
