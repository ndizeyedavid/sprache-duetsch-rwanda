import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
ResetUserPasswordInput
} from "./users.schema.js";
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
