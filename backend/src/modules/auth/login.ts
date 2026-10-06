import { unauthorized } from "../../lib/http-error.js";
import { verifyPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
LoginInput
} from "./auth.schema.js";
import { BLOCKED_LOGIN_STATUSES } from './blocked_login_statuses.js';
import { getUserProfile } from './get-user-profile.js';
import { issueTokens } from './issue-tokens.js';
import type { LoginResult } from './login-result.js';
import { portalAcceptsRole } from "./portal-access.js";
import type { RequestMeta } from './request-meta.js';
export const login = async (input: LoginInput, meta: RequestMeta): Promise<LoginResult> => {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });

  // Same error for unknown email and wrong password so accounts cannot be enumerated.
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw unauthorized("Invalid email or password");
  }

  if (BLOCKED_LOGIN_STATUSES.includes(user.status)) {
    throw unauthorized(`Account is ${user.status.toLowerCase()}`);
  }

  if (input.portal && !portalAcceptsRole(input.portal, user.role)) {
    const rightPortal = user.role === "STUDENT" ? "student" : user.role === "TEACHER" ? "teacher" : "staff";
    const path = rightPortal === "student" ? "/login" : `/login/${rightPortal}`;
    throw unauthorized(`This account uses the ${rightPortal} portal. Please sign in at ${path}.`);
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const tokens = await issueTokens(user.id, user.email, user.role, meta);
  const profile = await getUserProfile(user.id);

  return { user: profile, tokens };
};
