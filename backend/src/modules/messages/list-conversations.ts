import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
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
