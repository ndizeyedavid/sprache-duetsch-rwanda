import type {
  NotificationChannel,
  NotificationType,
  Prisma,
} from "../generated/prisma/client.js";
import { logger } from "./logger.js";
import { prisma } from "./prisma.js";

// Single fan-out point for user notifications.
//
// Every notification is persisted as an IN_APP row (the live inbox/badge).
// Non-IN_APP channels currently use a log driver: the intent is recorded and
// logged so a real provider (SMTP/Twilio/WhatsApp Business API) can be
// plugged in behind this interface once credentials exist — no call-site
// changes needed.
export interface NotifyInput {
  type: NotificationType;
  title: string;
  body: string;
  data?: Prisma.InputJsonValue;
  channel?: NotificationChannel;
}

const dispatchExternal = (userIds: string[], input: Required<Pick<NotifyInput, "channel">> & NotifyInput): void => {
  if (input.channel === "IN_APP") {
    return;
  }
  logger.info(
    { userCount: userIds.length, channel: input.channel, title: input.title },
    "External notification queued (log driver — no provider configured)",
  );
};

export const notifyUser = async (userId: string, input: NotifyInput) => {
  const channel = input.channel ?? "IN_APP";
  const notification = await prisma.notification.create({
    data: {
      userId,
      type: input.type,
      channel,
      title: input.title,
      body: input.body,
      data: input.data ?? undefined,
    },
  });
  dispatchExternal([userId], { ...input, channel });
  return notification;
};

export const notifyUsers = async (userIds: string[], input: NotifyInput) => {
  const unique = [...new Set(userIds)];
  if (unique.length === 0) {
    return { count: 0 };
  }
  const channel = input.channel ?? "IN_APP";
  const result = await prisma.notification.createMany({
    data: unique.map((userId) => ({
      userId,
      type: input.type,
      channel,
      title: input.title,
      body: input.body,
      data: input.data ?? undefined,
    })),
  });
  dispatchExternal(unique, { ...input, channel });
  return result;
};
