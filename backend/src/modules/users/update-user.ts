import type { Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import type {
UpdateUserInput
} from "./users.schema.js";
export const updateUser = async (id: string, input: UpdateUserInput, actorId?: string, actorRole?: Role) => {
  const before = await prisma.user.findUnique({ where: { id }, select: safeUserSelect });
  if (!before) {
    throw notFound("User not found");
  }

  if (actorRole === "ACADEMIC_ADMIN" && before.role !== "TEACHER") throw forbidden("Academic staff can manage teacher accounts only");
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
