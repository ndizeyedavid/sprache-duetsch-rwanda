import type { NotificationChannel,NotificationType,Prisma } from "../generated/prisma/client.js";
import { canEmailNotification,mergeNotificationPreferences } from "../modules/notifications/notification-preferences.js";
import type { NotificationPreferences } from "../modules/notifications/notifications.schema.js";
import { enqueueNotification } from "./notification-delivery.js";
import { prisma } from "./prisma.js";
import { transact } from "./transactions.js";
export interface NotifyInput {
  type: NotificationType; title: string; body: string; data?: Prisma.InputJsonValue;
  channel?: NotificationChannel; eventKey?: string;
}
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
export const notifyUser = (userId: string, input: NotifyInput) => notifyMessages([{ userId, input }]);
export const notifyUsers = (userIds: string[], input: NotifyInput) => notifyMessages([...new Set(userIds)].map(userId => ({ userId, input })));
export async function notifyMessages(messages: { userId: string; input: NotifyInput }[]) {
  const users = await prisma.user.findMany({ where: { id: { in: [...new Set(messages.map(m => m.userId))] } }, select: { id: true, email: true, notificationPreferences: true } });
  const byId = new Map(users.map(user => [user.id, user]));
  let count = 0;
  for (const { userId, input } of messages) {
    const user = byId.get(userId);
    if (!user) continue;
    const prefs = mergeNotificationPreferences(user.notificationPreferences as Partial<NotificationPreferences> | null);
    const topicEnabled = canEmailNotification(input.type, { ...prefs, email: true });
    const channelSupported = !input.channel || ['IN_APP', 'EMAIL'].includes(input.channel);
    const email = prefs.email && topicEnabled && channelSupported;
    const visible = prefs.inApp && topicEnabled && channelSupported;
    const queued = await transact(tx => enqueueNotification(tx, { userId, email: user.email,
      eventKey: input.eventKey ? `${input.eventKey}:${userId}` : undefined,
      mail: email ? { subject: input.title, text: input.body, html: `<p>${escapeHtml(input.body).replace(/\n/g, '<br>')}</p>` } : undefined,
      notification: visible ? { userId, type: input.type, channel: 'IN_APP', title: input.title, body: input.body, data: input.data } : undefined,
    }));
    if (queued) count++;
  }
  return { count };
}
