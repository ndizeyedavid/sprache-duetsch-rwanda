import { apiGet } from '.././api';
import type { NotificationItem } from './notification-item';
export function listNotifications(): Promise<NotificationItem[]> {
  return apiGet<NotificationItem[]>('/notifications?pageSize=50');
}
