import type { Prisma, Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, conflict, forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateUserInput,
  ListUserQuery,
  ResetUserPasswordInput,
  UpdateUserInput,
  UpdateUserRoleInput,
} from "./users.schema.js";

// Never expose passwordHash or internal relations on user endpoints.
const safeUserSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  phone: true,
  avatarUrl: true,
  role: true,
  status: true,
  lastLoginAt: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export const listUsers = async (query: ListUserQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.UserWhereInput = {};
  if (query.role) {
    where.role = query.role;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: safeUserSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const listTeachers = async () =>
  prisma.user.findMany({
    where: { role: "TEACHER", status: "ACTIVE" },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: safeUserSelect,
  });

export const getUser = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!user) {
    throw notFound("User not found");
  }
  return user;
};

export const createUser = async (
  input: CreateUserInput,
  actorRole: Role,
  actorId?: string,
) => {
  if (input.role === "STUDENT") {
    throw badRequest("Students are created via registration");
  }
  if (actorRole === "ACADEMIC_ADMIN" && input.role !== "TEACHER") {
    throw forbidden("Academic admins can only create teachers");
  }

  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    throw conflict("An account with this email already exists");
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone ?? null,
      role: input.role,
    },
    select: safeUserSelect,
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "USER_CREATED",
    entityType: "User",
    entityId: user.id,
    after: user,
  });

  return user;
};

export const updateUser = async (id: string, input: UpdateUserInput, actorId?: string) => {
  const before = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!before) {
    throw notFound("User not found");
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      avatarUrl: input.avatarUrl,
      status: input.status,
    },
    select: safeUserSelect,
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "USER_UPDATED",
    entityType: "User",
    entityId: user.id,
    before,
    after: user,
  });

  return user;
};

export const updateUserRole = async (
  id: string,
  input: UpdateUserRoleInput,
  actorId?: string,
) => {
  const before = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!before) {
    throw notFound("User not found");
  }

  const user = await prisma.user.update({
    where: { id },
    data: { role: input.role },
    select: safeUserSelect,
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "USER_ROLE_UPDATED",
    entityType: "User",
    entityId: user.id,
    before,
    after: user,
  });

  return user;
};

export const resetUserPassword = async (
  id: string,
  input: ResetUserPasswordInput,
  actorId?: string,
) => {
  const user = await prisma.user.findUnique({ where: { id }, select: { id: true } });
  if (!user) {
    throw notFound("User not found");
  }

  const passwordHash = await hashPassword(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { passwordHash } }),
    // Revoke every active session so the old credentials can no longer be used.
    prisma.refreshToken.deleteMany({ where: { userId: id } }),
  ]);

  await writeAudit({
    actorId: actorId ?? null,
    action: "USER_PASSWORD_RESET",
    entityType: "User",
    entityId: id,
  });
};
