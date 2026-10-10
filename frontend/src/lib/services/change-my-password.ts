import { apiPost } from '.././api';
export function changeMyPassword(body: { currentPassword: string; newPassword: string }): Promise<{ message: string }> {
  return apiPost('/auth/change-password', body);
}
