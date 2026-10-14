import { isProduction } from "../../config/env.js";
import { generateOpaqueToken,hashToken } from "../../lib/ids.js";
import { logger } from "../../lib/logger.js";
import { emailAvailable,queueTransactionalEmail } from "../../lib/notification-delivery.js";
import { prisma } from "../../lib/prisma.js";
import { appUrl,escapeHtml } from "./application-mail.js";

// New accounts get longer than a forgotten-password link: applicants may not check mail daily.
const INVITE_TTL_MS = 7 * 24 * 3_600_000;

export interface AccountInvite {
  emailQueued: boolean;
  emailConfigured: boolean;
  expiresAt: string;
  /** Only outside production, mirroring forgot-password, so staff can test without SMTP. */
  setupUrl?: string;
}

/**
 * Password setup reuses the reset-token table and the /reset-password page, so no plaintext
 * password is ever generated or shown to staff.
 */
export async function issueAccountInvite(user: { id: string; email: string; firstName: string }): Promise<AccountInvite> {
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  await prisma.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });

  const setupUrl = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
  let emailQueued = true;
  try {
    await queueTransactionalEmail(user.id, user.email, {
      subject: "Set up your Deutsch Sprache RW student account",
      text: `Hello ${user.firstName},\n\nYour student account is ready. Choose your password within 7 days: ${setupUrl}\n\nThen sign in at ${appUrl()}/login with ${user.email}.`,
      html: `<p>Hello ${escapeHtml(user.firstName)},</p><p>Your Deutsch Sprache RW student account is ready.</p><p><a href="${setupUrl}">Choose your password</a> (link valid for 7 days), then sign in with ${escapeHtml(user.email)}.</p>`,
    }, `account-invite:${tokenHash}`, expiresAt);
  } catch (error) {
    emailQueued = false;
    logger.error({ error, userId: user.id }, "Account setup email could not be queued");
  }
  return { emailQueued, emailConfigured: emailAvailable(), expiresAt: expiresAt.toISOString(), ...(isProduction ? {} : { setupUrl }) };
}
