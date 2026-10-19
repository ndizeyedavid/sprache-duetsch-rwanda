import type { Role } from "../../generated/prisma/client.js";
import { sessionReplaced, unauthorized } from "../../lib/http-error.js";

/** Students may only be signed in on one device at a time; staff keep multi-device access. */
export const enforcesSingleDevice = (role: Role): boolean => role === "STUDENT";

type SessionOwner = { role: Role; activeSessionId: string | null };

/**
 * Throws when a presented token no longer belongs to the account's one active session.
 * A different active session means another device signed in; no active session means
 * the account signed out (or its password was reset) and the token is simply stale.
 */
export const assertActiveSession = (user: SessionOwner, sessionId: string | undefined): void => {
  if (!enforcesSingleDevice(user.role)) return;
  if (sessionId && sessionId === user.activeSessionId) return;
  if (user.activeSessionId) throw sessionReplaced();
  throw unauthorized("Session has ended. Please sign in again.");
};
