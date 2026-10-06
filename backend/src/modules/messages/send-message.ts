import { notifyUsers } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import { assertMembership } from './assert-membership.js';
import { senderName } from './sender-name.js';
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
