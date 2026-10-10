import { apiPost } from '.././api';
import type { NotificationItem } from './notification-item';
export function createAnnouncement(body: {
  title: string;
  body: string;
  audience?: 'STUDENTS' | 'STAFF' | 'ALL';
  target?: {
    levelId?: string;
    intakeId?: string;
    campusId?: string;
    classGroupId?: string;
  };
}): Promise<NotificationItem> {
  return apiPost<NotificationItem>('/notifications/announcements', body);
}
