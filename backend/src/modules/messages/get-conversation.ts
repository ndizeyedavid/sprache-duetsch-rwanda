import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertMembership } from './assert-membership.js';
import { participantSelect } from './participant-select.js';
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
