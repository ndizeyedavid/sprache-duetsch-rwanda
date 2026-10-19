import { unauthorized } from "../../lib/http-error.js";
import { hashToken } from "../../lib/ids.js";
import { verifyRefreshToken } from "../../lib/jwt.js";
import { prisma } from "../../lib/prisma.js";
import type { AuthTokens } from './auth-tokens.js';
import { isLoginBlocked } from './blocked_login_statuses.js';
import { issueTokens } from './issue-tokens.js';
import type { RequestMeta } from './request-meta.js';
import { assertActiveSession } from './single-device-policy.js';
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
    select: { id: true, sessionId: true, revokedAt: true, expiresAt: true },
  });

  if (!stored || stored.expiresAt.getTime() < Date.now()) {
    throw unauthorized("Refresh token is no longer valid");
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, email: true, role: true, status: true, activeSessionId: true },
  });

  if (!user || isLoginBlocked(user)) {
    throw unauthorized("Account is not active");
  }

  // Checked before the revocation test so a student's replaced device learns why
  // (SESSION_REPLACED) instead of seeing a generic burned-token error.
  assertActiveSession(user, stored.sessionId);

  if (stored.revokedAt) {
    throw unauthorized("Refresh token is no longer valid");
  }

  // Rotation: the presented token is burned and a fresh pair is issued for the same session.
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revokedAt: new Date() },
  });

  return issueTokens(user.id, user.email, user.role, meta, stored.sessionId);
};
