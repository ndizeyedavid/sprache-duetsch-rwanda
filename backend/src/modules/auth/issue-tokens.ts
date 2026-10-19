import { randomUUID } from "node:crypto";
import type { Role } from "../../generated/prisma/client.js";
import { hashToken } from "../../lib/ids.js";
import { refreshTokenExpiry,signAccessToken,signRefreshToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthTokens } from './auth-tokens.js';
import type { RequestMeta } from './request-meta.js';
import { activateSingleDeviceSession } from './single-device.js';

/**
 * Issues an access + refresh pair. Without `sessionId` this is a fresh sign-in (new
 * session, students' other devices get signed out); with one it continues an existing
 * session, as refresh rotation does.
 */
export const issueTokens = async (
  userId: string,
  email: string,
  role: Role,
  meta: RequestMeta,
  sessionId?: string,
): Promise<AuthTokens> => {
  const session = sessionId ?? randomUUID();
  const accessToken = signAccessToken(userId, email, role, session);
  const refreshToken = signRefreshToken(userId, email, role, session);

  await prisma.refreshToken.create({
    data: {
      userId,
      sessionId: session,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
    },
  });

  if (!sessionId) {
    await activateSingleDeviceSession({ id: userId, role }, session, meta);
  }

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: refreshTokenExpiry().toISOString(),
  };
};
