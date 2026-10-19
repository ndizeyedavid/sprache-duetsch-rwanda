import type { Prisma } from "../../generated/prisma/client.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { ListNotificationQuery } from "./notifications.schema.js";

export const listNotifications = async (userId: string, query: ListNotificationQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.NotificationWhereInput = { userId };
  if (query.unread !== undefined) {
    where.readAt = query.unread ? null : { not: null };
  }
  if (query.type) {
    where.type = query.type;
  }

  const [rows, total] = await prisma.$transaction([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.notification.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getUnreadCount = async (userId: string) => {
  const count = await prisma.notification.count({ where: { userId, readAt: null } });
  return { count };
};

export const markNotificationRead = async (userId: string, id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true, readAt: true },
  });

  if (!notification) {
    throw notFound("Notification not found");
  }
  if (notification.userId !== userId) {
    throw forbidden("You cannot modify this notification");
  }
  if (notification.readAt) {
    return notification;
  }

  return prisma.notification.update({
    where: { id },
    data: { readAt: new Date() },
  });
};

export const markAllNotificationsRead = async (userId: string) => {
  const result = await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  return { updated: result.count };
};

export const deleteNotification = async (userId: string, id: string) => {
  const notification = await prisma.notification.findUnique({
    where: { id },
    select: { id: true, userId: true },
  });

  if (!notification) {
    throw notFound("Notification not found");
  }
  if (notification.userId !== userId) {
    throw forbidden("You cannot modify this notification");
  }

  await prisma.notification.delete({ where: { id } });
  return { id };
};

export { createAnnouncement } from "./create-announcement.js";
