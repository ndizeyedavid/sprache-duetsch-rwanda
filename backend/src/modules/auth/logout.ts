import { hashToken } from "../../lib/ids.js";
import { prisma } from "../../lib/prisma.js";
export const logout = async (token: string | undefined): Promise<void> => {
  if (!token) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};
