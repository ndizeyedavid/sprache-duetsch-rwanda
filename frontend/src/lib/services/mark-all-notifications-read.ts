import { apiPost } from '.././api';
export function markAllNotificationsRead(): Promise<unknown> {
  return apiPost('/notifications/read-all', {});
}
