import type { Prisma } from "../../generated/prisma/client.js";
import { notifyUsers } from "../../lib/notify.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";
import { parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateConversationInput,
  ListMessagesQuery,
} from "./messages.schema.js";

const participantSelect = {
  user: { select: { id: true, firstName: true, lastName: true, role: true } },
  lastReadAt: true,
} as const;

const senderName = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  return user ? `${user.firstName} ${user.lastName}`.trim() : "Sprache RW";
};

const assertMembership = async (conversationId: string, userId: string) => {
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) {
    throw forbidden("You are not a member of this conversation");
  }
  return membership;
};

export const listConversations = async (userId: string) => {
  const memberships = await prisma.conversationParticipant.findMany({
    where: { userId },
    include: {
      conversation: {
        include: {
          participants: { include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } } },
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
            include: { sender: { select: { id: true, firstName: true, lastName: true } } },
          },
        },
      },
    },
    orderBy: { conversation: { updatedAt: "desc" } },
  });

  return Promise.all(
    memberships.map(async (membership) => {
      const { conversation } = membership;
      const unreadWhere: Prisma.MessageWhereInput = {
        conversationId: conversation.id,
        senderId: { not: userId },
      };
      if (membership.lastReadAt) {
        unreadWhere.createdAt = { gt: membership.lastReadAt };
      }
      const unreadCount = await prisma.message.count({ where: unreadWhere });
      return { ...conversation, unreadCount };
    }),
  );
};

export const createConversation = async (creatorId: string, input: CreateConversationInput) => {
  const uniqueIds = [...new Set([...input.participantIds, creatorId])];

  const users = await prisma.user.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true, status: true },
  });
  if (users.length !== uniqueIds.length) {
    throw badRequest("One or more participants do not exist");
  }

  if (input.classGroupId) {
    const group = await prisma.classGroup.findUnique({
      where: { id: input.classGroupId },
      select: { id: true },
    });
    if (!group) {
      throw badRequest("Selected class group does not exist");
    }
  }

  // Idempotency for ad-hoc DMs: reuse an existing conversation with the exact same
  // participant set instead of creating duplicates. This covers both 1-1 chats and
  // group selections from People / ComposeModal when no title/classGroupId is given.
  const isAdHoc = !input.title && !input.classGroupId;
  if (isAdHoc) {
    const candidates = await prisma.conversation.findMany({
      where: {
        title: null,
        classGroupId: null,
        participants: { every: { userId: { in: uniqueIds } } },
      },
      include: { participants: { select: participantSelect } },
    });
    const existing = candidates.find(
      (c) => c.participants.length === uniqueIds.length && c.participants.every((p) => uniqueIds.includes(p.user.id)),
    );
    if (existing) return existing;
  }

  const conversation = await prisma.conversation.create({
    data: {
      title: input.title ?? null,
      classGroupId: input.classGroupId ?? null,
      createdById: creatorId,
      participants: {
        create: uniqueIds.map((userId) => ({
          userId,
          lastReadAt: userId === creatorId ? new Date() : null,
        })),
      },
    },
    include: { participants: { select: participantSelect } },
  });

  return conversation;
};

export const getConversation = async (userId: string, id: string) => {
  await assertMembership(id, userId);
  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: { select: participantSelect },
      classGroup: { select: { id: true, code: true, name: true } },
    },
  });
  if (!conversation) {
    throw notFound("Conversation not found");
  }
  return conversation;
};

export const listMessages = async (userId: string, conversationId: string, query: ListMessagesQuery) => {
  await assertMembership(conversationId, userId);
  const pagination = parsePagination(query, { defaultPageSize: 50 });

  const where: Prisma.MessageWhereInput = { conversationId };
  if (query.before) {
    const cursor = await prisma.message.findUnique({
      where: { id: query.before },
      select: { createdAt: true, conversationId: true },
    });
    if (!cursor || cursor.conversationId !== conversationId) {
      throw badRequest("Invalid message cursor");
    }
    where.createdAt = { lt: cursor.createdAt };
  }

  const rows = await prisma.message.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: pagination.take,
    include: { sender: { select: { id: true, firstName: true, lastName: true } } },
  });

  return rows.reverse();
};

export const sendMessage = async (userId: string, conversationId: string, body: string) => {
  await assertMembership(conversationId, userId);

  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, body },
    include: { sender: { select: { id: true, firstName: true, lastName: true } } },
  });

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });

  // Fan out in-app notifications so the unread badge stays live.
  const name = await senderName(userId);
  const others = await prisma.conversationParticipant.findMany({
    where: { conversationId, userId: { not: userId } },
    select: { userId: true },
  });
  await notifyUsers(
    others.map((row) => row.userId),
    {
      type: "MESSAGE",
      title: `New message from ${name}`,
      body: body.length > 140 ? `${body.slice(0, 140)}…` : body,
      data: { conversationId },
    },
  );

  return message;
};

export const markConversationRead = async (userId: string, conversationId: string) => {
  await assertMembership(conversationId, userId);
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });
  return { message: "Conversation marked as read" };
};

/**
 * People the requester may start a conversation with:
 * - students: classmates + teachers of their active class groups
 * - teachers: students in their own classes
 * - admins: all active staff
 */
export const listContacts = async (userId: string) => {
  const me = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });
  if (!me) {
    throw notFound("User not found");
  }

  if (me.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId },
      select: {
        id: true,
        enrollments: {
          where: { status: { in: ["ACTIVE", "COMPLETED"] } },
          select: { classGroupId: true },
        },
      },
    });
    const groupIds = (student?.enrollments ?? [])
      .map((enrollment) => enrollment.classGroupId)
      .filter((id): id is string => id !== null);
    if (groupIds.length === 0) return [];

    const [classmates, groups] = await Promise.all([
      prisma.enrollment.findMany({
        where: { classGroupId: { in: groupIds }, status: { in: ["ACTIVE", "COMPLETED"] }, student: { userId: { not: userId } } },
        select: {
          student: {
            select: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
          },
        },
      }),
      prisma.classGroup.findMany({
        where: { id: { in: groupIds } },
        select: { teacher: { select: { id: true, firstName: true, lastName: true, role: true } } },
      }),
    ]);

    const byId = new Map<string, { id: string; firstName: string; lastName: string; role: string }>();
    for (const row of classmates) byId.set(row.student.user.id, row.student.user);
    for (const group of groups) {
      if (group.teacher) byId.set(group.teacher.id, group.teacher);
    }
    return [...byId.values()];
  }

  if (me.role === "TEACHER") {
    const groups = await prisma.classGroup.findMany({
      where: { teacherId: userId },
      select: { id: true },
    });
    const groupIds = groups.map((group) => group.id);
    if (groupIds.length === 0) return [];

    const enrollments = await prisma.enrollment.findMany({
      where: { classGroupId: { in: groupIds }, status: { in: ["ACTIVE", "COMPLETED"] } },
      select: {
        student: {
          select: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
        },
      },
    });
    const byId = new Map<string, { id: string; firstName: string; lastName: string; role: string }>();
    for (const row of enrollments) byId.set(row.student.user.id, row.student.user);
    return [...byId.values()];
  }

  return prisma.user.findMany({
    where: { id: { not: userId }, status: "ACTIVE", role: { not: "STUDENT" } },
    select: { id: true, firstName: true, lastName: true, role: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: 100,
  });
};
