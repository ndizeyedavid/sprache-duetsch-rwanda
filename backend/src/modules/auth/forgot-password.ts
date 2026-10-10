import { env,isProduction } from "../../config/env.js";
import { writeAudit } from "../../lib/audit.js";
import { generateOpaqueToken,hashToken } from "../../lib/ids.js";
import { logger } from "../../lib/logger.js";
import { queueTransactionalEmail } from "../../lib/notification-delivery.js";
import { prisma } from "../../lib/prisma.js";
import type {
ForgotPasswordInput
} from "./auth.schema.js";
import type { ForgotPasswordResult } from './forgot-password-result.js';
import { RESET_TOKEN_TTL_MS } from './reset_token_ttl_ms.js';
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

  const resetUrl = `${env.PUBLIC_APP_URL.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}`;
  try {
    await queueTransactionalEmail(user.id, input.email.toLowerCase(), {
      subject: "Reset your Deutsch Sprache RW password",
      text: `Use this link within one hour to reset your password: ${resetUrl}`,
      html: `<p>We received a request to reset your Deutsch Sprache RW password.</p><p><a href="${resetUrl}">Reset your password</a></p><p>This link expires in one hour. If you did not request this, you can ignore this email.</p>`,
    }, `password-reset:${hashToken(token)}`, new Date(Date.now() + RESET_TOKEN_TTL_MS));
  } catch (error) {
    logger.error({ error }, "Password reset email could not be delivered");
  }
  return isProduction ? {} : { resetUrl };
};
