import type { Prisma, Role } from "../../generated/prisma/client.js";
import { notifyUser } from "../../lib/notify.js";
import { prisma } from "../../lib/prisma.js";
import type { RequestMeta } from "./request-meta.js";
import { enforcesSingleDevice } from "./single-device-policy.js";

const describeDevice = (meta: RequestMeta): string => {
  const ua = meta.userAgent ?? "";
  const browser = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "a browser";
  const os = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "an unknown device";
  return `${browser} on ${os}`;
};

/**
 * Makes `sessionId` the account's only live session: every other refresh token is
 * revoked and the previous device is told why it was signed out. Returns whether a
 * previous session was replaced so callers can surface it.
 */
export const activateSingleDeviceSession = async (
  user: { id: string; role: Role },
  sessionId: string,
  meta: RequestMeta,
): Promise<boolean> => {
  if (!enforcesSingleDevice(user.role)) return false;
  const replaced = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const other = await tx.refreshToken.updateMany({
      where: { userId: user.id, revokedAt: null, sessionId: { not: sessionId } },
      data: { revokedAt: new Date() },
    });
    await tx.user.update({ where: { id: user.id }, data: { activeSessionId: sessionId } });
    return other.count > 0;
  });
  if (replaced) {
    await notifyUser(user.id, {
      type: "SYSTEM",
      title: "Signed in on a new device",
      body: `Your account was just signed in from ${describeDevice(meta)}, so the previous device has been signed out. Student accounts work on one device at a time.\n\nIf this was not you, change your password right away.`,
      eventKey: `session-replaced:${sessionId}`,
    });
  }
  return replaced;
};

