import type { Prisma } from "../../generated/prisma/client.js";
import { isProduction } from "../../config/env.js";
import { renderEmail } from "../../lib/email-layout.js";
import { generateOpaqueToken, hashToken } from "../../lib/ids.js";
import { emailAvailable } from "../../lib/notification-delivery.js";
import { transact } from "../../lib/transactions.js";
import { appUrl } from "./application-mail.js";

const INVITE_TTL_MS = 7 * 24 * 3_600_000;
type InviteUser = { id: string; email: string; firstName: string };

export interface AccountInvite {
  emailQueued: boolean;
  emailConfigured: boolean;
  expiresAt: string;
  /** Only returned to authenticated staff outside production. */
  setupUrl?: string;
}

/** The hashed token and email outbox row commit together. The recipient proves
 * ownership of the email address by redeeming the one-time password-setup link.
 */
export async function queueAccountInvite(tx: Prisma.TransactionClient, user: InviteUser): Promise<AccountInvite> {
  const token = generateOpaqueToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + INVITE_TTL_MS);
  const setupUrl = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}&setup=1`;
  const mail = {
    subject: "Verify your email and set up your student account",
    ...renderEmail({
      preheader: "Your student portal account is ready. Verify your email and choose a password.",
      title: "Welcome to your student portal",
      greeting: `Hallo ${user.firstName},`,
      paragraphs: [
        "We created your Deutsch Sprache RW student portal account. Use the button below to verify your email address and choose your own password.",
        "Course approval and enrollment are handled separately by admissions. Setting up your account does not automatically enroll you in a course.",
      ],
      action: { label: "Verify email & choose password", url: setupUrl },
      footnote: "This link works once and expires in 7 days. If it expires, request a new link from the portal's Forgot password page. If you did not apply, you can ignore this email.",
    }),
  };
  await tx.passwordResetToken.create({ data: { userId: user.id, tokenHash, expiresAt } });
  await tx.notificationDelivery.create({ data: {
    userId: user.id, email: user.email, eventKey: `account-invite:${tokenHash}`,
    payload: { mail, expiresAt: expiresAt.toISOString() },
  } });
  return { emailQueued: true, emailConfigured: emailAvailable(), expiresAt: expiresAt.toISOString(),
    ...(isProduction ? {} : { setupUrl }) };
}

/** Staff-triggered setup uses the same secure flow as public enrollment. */
export const issueAccountInvite = (user: InviteUser): Promise<AccountInvite> =>
  transact((tx) => queueAccountInvite(tx, user));
