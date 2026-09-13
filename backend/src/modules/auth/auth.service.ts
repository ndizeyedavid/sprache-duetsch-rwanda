import { isProduction } from "../../config/env.js";
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
