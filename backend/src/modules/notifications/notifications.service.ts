import { randomUUID } from "node:crypto";
import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { STAFF_ROLES } from "../../lib/roles.js";
import type {
  CreateAnnouncementInput,
  ListNotificationQuery,
} from "./notifications.schema.js";

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

// Resolve the recipient userIds for an announcement, then fan out one Notification
// row per recipient. Targeting fields are unioned and deduplicated.
export const createAnnouncement = async (input: CreateAnnouncementInput, actorId?: string) => {
  const target = input.target;
  const userIds = new Set<string>();

  const addStudents = async (where: Prisma.StudentWhereInput): Promise<void> => {
    const students = await prisma.student.findMany({ where, select: { userId: true } });
    for (const student of students) userIds.add(student.userId);
  };

  const hasTarget = Boolean(
    target &&
      (target.studentIds?.length ||
        target.classGroupId ||
        target.levelId ||
        target.intakeId ||
        target.campusId),
  );

  if (hasTarget && target) {
    if (target.studentIds && target.studentIds.length > 0) {
      await addStudents({ id: { in: target.studentIds } });
    }
    if (target.classGroupId) {
      await addStudents({
        enrollments: { some: { classGroupId: target.classGroupId, status: "ACTIVE" } },
      });
    }
    if (target.levelId) {
      await addStudents({
        enrollments: { some: { levelId: target.levelId, status: "ACTIVE" } },
      });
    }
    if (target.intakeId) {
      await addStudents({
        enrollments: { some: { intakeId: target.intakeId, status: "ACTIVE" } },
      });
    }
    if (target.campusId) {
      await addStudents({ campusId: target.campusId, status: "ACTIVE" });
    }
  } else if (input.audience === "STAFF") {
    const users = await prisma.user.findMany({
      where: { role: { in: STAFF_ROLES }, status: "ACTIVE" },
      select: { id: true },
    });
    for (const user of users) userIds.add(user.id);
  } else if (input.audience === "ALL") {
    const users = await prisma.user.findMany({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    for (const user of users) userIds.add(user.id);
  } else {
    await addStudents({ status: "ACTIVE" });
  }

  const recipients = [...userIds];
  const batchId = randomUUID();

  if (recipients.length > 0) {
    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type: input.type,
        channel: input.channel,
        title: input.title,
        body: input.body,
        data: { batchId },
      })),
    });
  }

  await writeAudit({
    actorId: actorId ?? null,
    action: "ANNOUNCEMENT_SENT",
    entityType: "Notification",
    entityId: batchId,
    after: {
      audience: input.audience,
      type: input.type,
      channel: input.channel,
      target: target ?? null,
      recipientCount: recipients.length,
    },
  });

  return { recipientCount: recipients.length };
};
