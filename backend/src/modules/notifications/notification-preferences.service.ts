import { notFound } from '../../lib/http-error.js';
import { prisma } from '../../lib/prisma.js';
import { mergeNotificationPreferences } from './notification-preferences.js';
import type { NotificationPreferences } from './notifications.schema.js';

export async function getPreferences(userId: string): Promise<NotificationPreferences> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { notificationPreferences: true } });
  if (!user) throw notFound('User not found');
  return mergeNotificationPreferences(user.notificationPreferences as Partial<NotificationPreferences> | null);
}

export async function updatePreferences(userId: string, preferences: NotificationPreferences): Promise<NotificationPreferences> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { notificationPreferences: preferences },
    select: { notificationPreferences: true },
  });
  return mergeNotificationPreferences(user.notificationPreferences as Partial<NotificationPreferences> | null);
}
