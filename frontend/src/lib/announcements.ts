import { api } from './api';
import type { InboxNotification } from './notifications';
import { markInboxRead } from './notifications';

/** An announcement as delivered to one member (an ANNOUNCEMENT notification row). */
export type Announcement = InboxNotification & { data?: { from?: string; batchId?: string } | null };

type Envelope = { data: Announcement[] };

/** Unread school announcements for the signed-in user, newest first. */
export async function listUnreadAnnouncements(): Promise<Announcement[]> {
  const { data } = await api.get<Envelope>('/notifications', { params: { type: 'ANNOUNCEMENT', unread: 'true', pageSize: 20 } });
  return data.data;
}

export const markAnnouncementRead = (id: string) => markInboxRead(id);
