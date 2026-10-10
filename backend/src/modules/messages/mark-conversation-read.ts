import { prisma } from "../../lib/prisma.js";
import { assertMembership } from './assert-membership.js';
export const markConversationRead = async (userId: string, conversationId: string) => {
  await assertMembership(conversationId, userId);
  await prisma.conversationParticipant.update({
    where: { conversationId_userId: { conversationId, userId } },
    data: { lastReadAt: new Date() },
  });
  return { message: "Conversation marked as read" };
};
