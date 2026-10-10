import { forbidden } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const assertMembership = async (conversationId: string, userId: string) => {
  const membership = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId } },
  });
  if (!membership) {
    throw forbidden("You are not a member of this conversation");
  }
  return membership;
};
