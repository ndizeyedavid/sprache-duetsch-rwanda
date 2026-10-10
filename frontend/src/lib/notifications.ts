import { apiGet,apiPut } from './api';

export type NotificationPreferences = {
  email: boolean;
  inApp: boolean;
  schedule: boolean;
  exam: boolean;
  payment: boolean;
};

export function getNotificationPreferences(): Promise<NotificationPreferences> {
  return apiGet('/notifications/preferences');
}

export function saveNotificationPreferences(value: NotificationPreferences): Promise<NotificationPreferences> {
  return apiPut('/notifications/preferences', value);
}
