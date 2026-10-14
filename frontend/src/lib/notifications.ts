import { api,apiDelete,apiGet,apiPatch,apiPost,apiPut } from './api';

/** Channels (`email`, `inApp`) × topics (`schedule`, `exam`, `payment`) — see backend notification-preferences.ts. */
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

/** One in-app notification row; `data` carries ids used to deep-link (assignmentId, conversationId…). */
export type InboxNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  data?: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

export type InboxPage = { rows: InboxNotification[]; hasNext: boolean };

type PaginatedEnvelope<T> = { success: boolean; data: T[]; meta?: { hasNext?: boolean } };

/** Paginated inbox, newest first. Unwraps the envelope here so pages never touch it. */
export async function listInbox(options: { page?: number; pageSize?: number; unread?: boolean } = {}): Promise<InboxPage> {
  const params: Record<string, string | number> = { page: options.page ?? 1, pageSize: options.pageSize ?? 20 };
  if (options.unread) params.unread = 'true';
  const { data } = await api.get<PaginatedEnvelope<InboxNotification>>('/notifications', { params });
  return { rows: data.data, hasNext: Boolean(data.meta?.hasNext) };
}

export async function getUnreadNotificationCount(): Promise<number> {
  const result = await apiGet<{ count: number }>('/notifications/unread-count');
  return result.count;
}

export function markInboxRead(id: string): Promise<unknown> {
  return apiPatch(`/notifications/${encodeURIComponent(id)}/read`, {});
}

export function markInboxAllRead(): Promise<{ updated: number }> {
  return apiPost('/notifications/read-all', {});
}

export function deleteInboxNotification(id: string): Promise<{ id: string }> {
  return apiDelete(`/notifications/${encodeURIComponent(id)}`);
}
