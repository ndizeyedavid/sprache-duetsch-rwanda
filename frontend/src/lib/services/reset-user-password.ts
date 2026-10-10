import { apiPost } from '.././api';
export function resetUserPassword(id: string, newPassword: string): Promise<unknown> {
  return apiPost(`/users/${id}/reset-password`, { newPassword });
}
