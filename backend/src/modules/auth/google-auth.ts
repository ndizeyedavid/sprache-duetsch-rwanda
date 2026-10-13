import { OAuth2Client } from "google-auth-library";
import { env } from "../../config/env.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest,notFound,unauthorized } from "../../lib/http-error.js";
import { generateOpaqueToken,generateStudentCode } from "../../lib/ids.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import { BLOCKED_LOGIN_STATUSES } from './blocked_login_statuses.js';
import { getUserProfile } from './get-user-profile.js';
import { issueTokens } from './issue-tokens.js';
import type { LoginResult } from './login-result.js';
import type { AuthPortal } from "./portal-access.js";
import { portalAcceptsRole } from "./portal-access.js";
import type { RequestMeta } from './request-meta.js';
export const googleAuth = async (
  idToken: string,
  meta: RequestMeta,
  portal?: AuthPortal,
): Promise<LoginResult> => {
  if (env.GOOGLE_AUTH_ENABLED !== "true") throw notFound("Google sign-in is disabled");
  if (!env.GOOGLE_CLIENT_ID) throw badRequest("Google sign-in is not configured");

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  let payload: { email?: string; given_name?: string; family_name?: string; name?: string; picture?: string; sub: string; email_verified?: boolean } | null = null;
  // Only ID tokens issued for our own client ID are accepted. Access tokens are
  // rejected: their audience cannot be checked, so a token from another app could log in.
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    if (p?.email && p.sub) payload = p;
  } catch {
    payload = null;
  }
  if (!payload) throw unauthorized("Invalid Google token");

  if (payload.email_verified !== true) throw unauthorized("Google email not verified");

  const email = payload.email!.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (BLOCKED_LOGIN_STATUSES.includes(existing.status)) throw unauthorized(`Account is ${existing.status.toLowerCase()}`);
    if (portal && !portalAcceptsRole(portal, existing.role)) {
      const rightPortal = existing.role === "STUDENT" ? "student" : existing.role === "TEACHER" ? "teacher" : "staff";
      throw unauthorized(`This account uses the ${rightPortal} portal.`);
    }
    await prisma.user.update({ where: { id: existing.id }, data: { lastLoginAt: new Date(), avatarUrl: existing.avatarUrl ?? payload.picture ?? undefined } });
    const tokens = await issueTokens(existing.id, existing.email, existing.role, meta);
    const profile = await getUserProfile(existing.id);
    return { user: profile, tokens };
  }

  // New user — only auto-create for student portal; staff must be provisioned by admin
  if (portal === "teacher" || portal === "staff") throw unauthorized("No account found for this Google email — contact administration");

  const firstName = (payload.given_name ?? payload.name?.split(" ")[0] ?? "Student").trim().slice(0, 80) || "Student";
  const lastName = (payload.family_name ?? payload.name?.split(" ").slice(1).join(" ") ?? "User").trim().slice(0, 80) || "User";
  const avatarUrl = payload.picture ?? null;

  const campus = await prisma.campus.findFirst({ where: { isActive: true }, select: { id: true } });
  if (!campus) throw badRequest("No active campus — contact administration");

  const randomHash = await hashPassword(generateOpaqueToken());

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email, firstName, lastName, passwordHash: randomHash, role: "STUDENT", status: "PENDING", avatarUrl },
    });
    const studentCode = await generateStudentCode(tx);
    const student = await tx.student.create({
      data: { userId: user.id, studentCode, campusId: campus.id, shift: "EVENING", status: "PENDING", finance: { create: {} } },
    });
    return { user, student };
  });

  await writeAudit({ actorId: created.user.id, action: "STUDENT_REGISTERED", entityType: "Student", entityId: created.student.id, after: { studentCode: created.student.studentCode, email, via: "google" }, ...meta });

  const tokens = await issueTokens(created.user.id, created.user.email, created.user.role, meta);
  const profile = await getUserProfile(created.user.id);
  return { user: profile, tokens };
};
