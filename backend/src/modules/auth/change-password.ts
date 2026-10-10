import { writeAudit } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { hashPassword,verifyPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
ChangePasswordInput
} from "./auth.schema.js";
import { revokeAllSessions } from './revoke-all-sessions.js';
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
