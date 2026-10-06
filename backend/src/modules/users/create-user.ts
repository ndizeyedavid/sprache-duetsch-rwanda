import type { Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest,conflict,forbidden } from "../../lib/http-error.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import type {
CreateUserInput
} from "./users.schema.js";
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
