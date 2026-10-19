import type { AccountStatus,Role } from "../../generated/prisma/client.js";
export const BLOCKED_LOGIN_STATUSES: AccountStatus[] = ["SUSPENDED", "WITHDRAWN"];

/**
 * Suspended students may still sign in so they can read why (requireAuth then limits them to
 * their own profile and sign-out). Every other blocked account is refused at the door.
 */
export const isLoginBlocked = (user: { status: AccountStatus; role: Role }): boolean =>
  BLOCKED_LOGIN_STATUSES.includes(user.status) && !(user.status === "SUSPENDED" && user.role === "STUDENT");
