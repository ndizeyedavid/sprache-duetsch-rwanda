import type { Role } from "../../generated/prisma/client.js";
import { hashToken } from "../../lib/ids.js";
import { refreshTokenExpiry,signAccessToken,signRefreshToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthTokens } from './auth-tokens.js';
import type { RequestMeta } from './request-meta.js';
export const issueTokens = async (
  userId: string,
  email: string,
  role: Role,
  meta: RequestMeta,
): Promise<AuthTokens> => {
  const accessToken = signAccessToken(userId, email, role);
  const refreshToken = signRefreshToken(userId, email, role);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: refreshTokenExpiry(),
      userAgent: meta.userAgent ?? null,
      ipAddress: meta.ipAddress ?? null,
    },
  });

  return {
    accessToken,
    refreshToken,
    tokenType: "Bearer",
    expiresIn: refreshTokenExpiry().toISOString(),
  };
};
