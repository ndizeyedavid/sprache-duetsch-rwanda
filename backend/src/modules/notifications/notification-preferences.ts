import type { NotificationType } from '../../generated/prisma/client.js';
import type { NotificationPreferences } from './notifications.schema.js';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: true, inApp: true, schedule: true, exam: true, payment: true,
};

export function mergeNotificationPreferences(value: Partial<NotificationPreferences> | null): NotificationPreferences {
  return { ...DEFAULT_NOTIFICATION_PREFERENCES, ...value };
}

export function canEmailNotification(type: NotificationType, preferences: NotificationPreferences): boolean {
  if (!preferences.email) return false;
  if (type === 'SCHEDULE' || type === 'CLASS') return preferences.schedule;
  if (type === 'EXAM' || type === 'ASSIGNMENT' || type === 'LESSON') return preferences.exam;
  if (type === 'PAYMENT') return preferences.payment;
  return true;
}
