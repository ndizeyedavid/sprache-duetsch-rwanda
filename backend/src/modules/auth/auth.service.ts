import { OAuth2Client } from "google-auth-library";
import { env, isProduction } from "../../config/env.js";
import type { AccountStatus, Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, conflict, notFound, unauthorized } from "../../lib/http-error.js";
import { generateOpaqueToken, generateStudentCode, hashToken } from "../../lib/ids.js";
import { refreshTokenExpiry, signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/jwt.js";
import { hashPassword, verifyPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
  ChangePasswordInput,
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from "./auth.schema.js";

export interface RequestMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: string;
}

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;
const BLOCKED_LOGIN_STATUSES: AccountStatus[] = ["SUSPENDED", "WITHDRAWN"];

const issueTokens = async (
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

export const getUserProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      phone: true,
      firstName: true,
      lastName: true,
      role: true,
      status: true,
      avatarUrl: true,
      lastLoginAt: true,
      createdAt: true,
      student: {
        select: {
          id: true,
          studentCode: true,
          status: true,
          shift: true,
          campus: { select: { id: true, code: true, name: true } },
          intake: { select: { id: true, code: true, name: true } },
          intendedLevel: { select: { id: true, code: true, title: true } },
          currentLevel: { select: { id: true, code: true, title: true } },
          finance: {
            select: { totalDue: true, totalPaid: true, balance: true, currency: true, status: true },
          },
        },
      },
    },
  });

  if (!user) {
    throw notFound("User not found");
  }

  return user;
};

export interface RegisterResult {
  user: Awaited<ReturnType<typeof getUserProfile>>;
  tokens: AuthTokens;
}

export const registerStudent = async (
  input: RegisterInput,
  meta: RequestMeta,
): Promise<RegisterResult> => {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw conflict("An account with this email already exists");
  }

  const campus = await prisma.campus.findUnique({
    where: { id: input.campusId },
    select: { id: true, isActive: true },
  });
  if (!campus || !campus.isActive) {
    throw badRequest("Selected campus is not available");
  }

  const passwordHash = await hashPassword(input.password);

  const created = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email,
        phone: input.phone ?? null,
        firstName: input.firstName,
        lastName: input.lastName,
        passwordHash,
        role: "STUDENT",
        status: "PENDING",
      },
    });

    const studentCode = await generateStudentCode(tx);

    const student = await tx.student.create({
      data: {
        userId: user.id,
        studentCode,
        campusId: input.campusId,
        intakeId: input.intakeId ?? null,
        intendedLevelId: input.intendedLevelId ?? null,
        shift: input.shift,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : null,
        status: "PENDING",
        // Financial profile is created up-front with zero balances so the student
        // always has an account to show, even before any charge exists.
        finance: { create: {} },
      },
    });

    return { user, student };
  });

  await writeAudit({
    actorId: created.user.id,
    action: "STUDENT_REGISTERED",
    entityType: "Student",
    entityId: created.student.id,
    after: { studentCode: created.student.studentCode, email },
    ...meta,
  });

  const tokens = await issueTokens(created.user.id, created.user.email, created.user.role, meta);
  const user = await getUserProfile(created.user.id);

  return { user, tokens };
};

export interface LoginResult {
  user: Awaited<ReturnType<typeof getUserProfile>>;
  tokens: AuthTokens;
}

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

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const tokens = await issueTokens(user.id, user.email, user.role, meta);
  const profile = await getUserProfile(user.id);

  return { user: profile, tokens };
};

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

export const logout = async (token: string | undefined): Promise<void> => {
  if (!token) {
    return;
  }

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(token), revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export const revokeAllSessions = async (userId: string): Promise<void> => {
  await prisma.refreshToken.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
};

export interface ForgotPasswordResult {
  // Dev convenience only; production would deliver this by email.
  resetToken?: string;
}

export const forgotPassword = async (
  input: ForgotPasswordInput,
): Promise<ForgotPasswordResult> => {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
    select: { id: true },
  });

  // Always report success so the endpoint cannot be used to probe registered emails.
  if (!user) {
    return {};
  }

  const token = generateOpaqueToken();

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    },
  });

  await writeAudit({
    actorId: user.id,
    action: "PASSWORD_RESET_REQUESTED",
    entityType: "User",
    entityId: user.id,
  });

  return isProduction ? {} : { resetToken: token };
};

export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw badRequest("Reset token is invalid or has expired");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
  ]);

  await writeAudit({
    actorId: record.userId,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "User",
    entityId: record.userId,
  });
};

export const changePassword = async (
  userId: string,
  input: ChangePasswordInput,
): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    throw notFound("User not found");
  }

  if (!(await verifyPassword(input.currentPassword, user.passwordHash))) {
    throw badRequest("Current password is incorrect");
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  await revokeAllSessions(userId);

  await writeAudit({
    actorId: userId,
    action: "PASSWORD_CHANGED",
    entityType: "User",
    entityId: userId,
  });
};

export const updateMyProfile = async (userId: string, input: UpdateProfileInput) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) throw notFound("User not found");
  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
    },
    select: { id: true, email: true, firstName: true, lastName: true, phone: true, avatarUrl: true, role: true, status: true },
  });
  await writeAudit({ actorId: userId, action: "PROFILE_UPDATED", entityType: "User", entityId: userId, after: updated });
  return updated;
};

export const googleAuth = async (
  idToken: string,
  meta: RequestMeta,
  portal?: string,
): Promise<LoginResult> => {
  if (!env.GOOGLE_CLIENT_ID) throw badRequest("Google sign-in is not configured");

  const client = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  let payload: { email?: string; given_name?: string; family_name?: string; name?: string; picture?: string; sub: string; email_verified?: boolean } | null = null;
  try {
    const ticket = await client.verifyIdToken({ idToken, audience: env.GOOGLE_CLIENT_ID });
    const p = ticket.getPayload();
    if (p?.email && p.sub) payload = p as unknown as typeof payload;
  } catch {
    // verifyIdToken failed — may be an access_token, try userinfo fallback below
  }

  if (!payload) {
    try {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error("userinfo failed");
      const data = (await res.json()) as { email?: string; given_name?: string; family_name?: string; name?: string; picture?: string; sub?: string; email_verified?: boolean | string };
      if (!data.email || !data.sub) throw new Error("Invalid userinfo payload");
      payload = { email: data.email, given_name: data.given_name, family_name: data.family_name, name: data.name, picture: data.picture, sub: data.sub!, email_verified: data.email_verified === true || data.email_verified === "true" };
    } catch {
      throw unauthorized("Invalid Google token");
    }
  }

  if (payload.email_verified === false) throw unauthorized("Google email not verified");

  const email = payload.email!.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    if (BLOCKED_LOGIN_STATUSES.includes(existing.status)) throw unauthorized(`Account is ${existing.status.toLowerCase()}`);
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

  const randomHash = await hashPassword(payload.sub + env.JWT_SECRET);

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
