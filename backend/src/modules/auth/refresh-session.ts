import { unauthorized } from "../../lib/http-error.js";
import { hashToken } from "../../lib/ids.js";
import { verifyRefreshToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthTokens } from './auth-tokens.js';
import { BLOCKED_LOGIN_STATUSES } from './blocked_login_statuses.js';
import { issueTokens } from './issue-tokens.js';
import type { RequestMeta } from './request-meta.js';
export const refreshSession = async (
  token: string | undefined,
  meta: RequestMeta,
): Promise<AuthTokens> => {
  if (!token) {
    throw unauthorized("Refresh token is required");
  }

  const payload = verifyRefreshToken(token);
  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { id: true, revokedAt: true, expiresAt: true },
  });

  if (!stored || stored.revokedAt || stored.expiresAt.getTime() < Date.now()) {
    throw unauthorized("Refresh token is no longer valid");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, status: true },
  });

  if (!user || BLOCKED_LOGIN_STATUSES.includes(user.status)) {
    throw unauthorized("Account is not active");
  }

  // Rotation: the presented token is burned and a fresh pair is issued.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(user.id, user.email, user.role, meta);
};
