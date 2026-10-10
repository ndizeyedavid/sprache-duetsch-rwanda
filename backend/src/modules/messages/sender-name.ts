import { prisma } from "../../lib/prisma.js";
export const senderName = async (userId: string): Promise<string> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  return user ? `${user.firstName} ${user.lastName}`.trim() : "Sprache RW";
};
