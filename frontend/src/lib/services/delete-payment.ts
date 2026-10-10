import { apiDelete } from '.././api';
export function deletePayment(id: string, reason: string): Promise<unknown> {
  return apiDelete(`/payments/${id}`, { data: { reason } });
}
