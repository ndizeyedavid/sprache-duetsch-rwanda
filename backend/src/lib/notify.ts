import type { NotificationChannel,NotificationType,Prisma } from "../generated/prisma/client.js";
import { canEmailNotification,mergeNotificationPreferences } from "../modules/notifications/notification-preferences.js";
import type { NotificationPreferences } from "../modules/notifications/notifications.schema.js";
import type { EmailContent } from "./email-layout.js";
import { renderEmail } from "./email-layout.js";
import { enqueueNotification } from "./notification-delivery.js";
import { prisma } from "./prisma.js";
import { transact } from "./transactions.js";
export interface NotifyInput {
  type: NotificationType; title: string; body: string; data?: Prisma.InputJsonValue;
  channel?: NotificationChannel; eventKey?: string;
  /** Email-only extras: amount rows, a call-to-action button and a closing note. */
  email?: Pick<EmailContent, "details" | "action" | "footnote">;
  /** School announcements: always in-app and emailed, whatever the recipient's notification settings. */
  important?: boolean;
}
export const notifyUser = (userId: string, input: NotifyInput) => notifyMessages([{ userId, input }]);
export const notifyUsers = (userIds: string[], input: NotifyInput) => notifyMessages([...new Set(userIds)].map(userId => ({ userId, input })));
export async function notifyMessages(messages: { userId: string; input: NotifyInput }[]) {
  const users = await prisma.user.findMany({ where: { id: { in: [...new Set(messages.map(m => m.userId))] } }, select: { id: true, email: true, firstName: true, notificationPreferences: true } });
  const byId = new Map(users.map(user => [user.id, user]));
  let count = 0;
  for (const { userId, input } of messages) {
    const user = byId.get(userId);
    if (!user) continue;
    const prefs = mergeNotificationPreferences(user.notificationPreferences as Partial<NotificationPreferences> | null);
    const topicEnabled = canEmailNotification(input.type, { ...prefs, email: true });
    const channelSupported = !input.channel || ['IN_APP', 'EMAIL'].includes(input.channel);
    const email = channelSupported && (input.important || (prefs.email && topicEnabled));
    const visible = channelSupported && (input.important || (prefs.inApp && topicEnabled));
    const queued = await transact(tx => enqueueNotification(tx, { userId, email: user.email,
      eventKey: input.eventKey ? `${input.eventKey}:${userId}` : undefined,
      mail: email ? { subject: input.title, ...renderEmail({ preheader: input.body, title: input.title, greeting: `Hallo ${user.firstName},`,
        paragraphs: input.body.split(/\n{2,}/), ...input.email }) } : undefined,
      notification: visible ? { userId, type: input.type, channel: 'IN_APP', title: input.title, body: input.body, data: input.data } : undefined,
    }));
    if (queued) count++;
  }
  return { count };
}
