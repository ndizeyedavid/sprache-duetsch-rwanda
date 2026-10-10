import { apiGet } from '.././api';
export function unreadCount(): Promise<{ count: number }> {
  return apiGet<{ count: number }>('/notifications/unread-count');
}
