import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import type {
UpdateUserRoleInput
} from "./users.schema.js";
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
