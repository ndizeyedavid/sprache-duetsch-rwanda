import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import type {
CreateConversationInput
} from "./messages.schema.js";
import { participantSelect } from './participant-select.js';
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
