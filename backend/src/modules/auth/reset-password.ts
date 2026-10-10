import { writeAudit } from "../../lib/audit.js";
import { badRequest } from "../../lib/http-error.js";
import { hashToken } from "../../lib/ids.js";
import { hashPassword } from "../../lib/password.js";
import { prisma } from "../../lib/prisma.js";
import type {
ResetPasswordInput
} from "./auth.schema.js";
export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(input.token) },
    select: { id: true, userId: true, usedAt: true, expiresAt: true },
  });

  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    throw badRequest("Reset token is invalid or has expired");
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction(async tx => {
    const claimed = await tx.passwordResetToken.updateMany({
      where: { id: record.id, usedAt: null, expiresAt: { gt: new Date() } },
      data: { usedAt: new Date() },
    });
    if (!claimed.count) throw badRequest("Reset token is invalid or has expired");
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.refreshToken.updateMany({
      where: { userId: record.userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  });

  await writeAudit({
    actorId: record.userId,
    action: "PASSWORD_RESET_COMPLETED",
    entityType: "User",
    entityId: record.userId,
  });
};
