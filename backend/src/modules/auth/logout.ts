import { hashToken } from "../../lib/ids.js";
import { prisma } from "../../lib/prisma.js";
export const logout = async (token: string | undefined): Promise<void> => {
  if (!token) {
    return;
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, userId: true, sessionId: true, revokedAt: true },
  });
  if (!stored || stored.revokedAt) return;

  await prisma.$transaction([
    prisma.refreshToken.updateMany({
      where: { sessionId: stored.sessionId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    // Signing out the active device ends the session for its access token too.
    prisma.user.updateMany({
      where: { id: stored.userId, activeSessionId: stored.sessionId },
      data: { activeSessionId: null },
    }),
  ]);
};
