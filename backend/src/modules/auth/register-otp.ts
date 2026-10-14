import { randomInt, timingSafeEqual } from "node:crypto";
import { isProduction } from "../../config/env.js";
import type { Prisma } from "../../generated/prisma/client.js";
import { canReceiveMail } from "../../lib/email-domain.js";
import { renderEmail } from "../../lib/email-layout.js";
import { AppError, badRequest, conflict } from "../../lib/http-error.js";
import { hashToken } from "../../lib/ids.js";
import { logger } from "../../lib/logger.js";
import { sendMail } from "../../lib/mailer.js";
import { emailAvailable } from "../../lib/notification-delivery.js";
import { prisma } from "../../lib/prisma.js";
import type { RegisterOtpInput } from "./auth.schema.js";

const PURPOSE = "REGISTER";
const OTP_TTL_MINUTES = 10;
const RESEND_AFTER_SECONDS = 60;
const MAX_ATTEMPTS = 5;

const hashCode = (email: string, code: string) => hashToken(`${PURPOSE}:${email}:${code}`);

/** Emails a 6-digit code that must be presented to POST /auth/register. Older codes stop working. */
export async function requestRegisterOtp(input: RegisterOtpInput) {
  const email = input.email.toLowerCase();
  if (await prisma.user.findUnique({ where: { email }, select: { id: true } })) {
    throw conflict("An account with this email already exists");
  }
  if (emailAvailable() && !await canReceiveMail(email)) {
    throw badRequest("We can't deliver email to this address. Check the spelling or use another email.");
  }
  const latest = await prisma.emailOtp.findFirst({ where: { email, purpose: PURPOSE }, orderBy: { createdAt: "desc" } });
  const waitSeconds = latest ? Math.ceil(RESEND_AFTER_SECONDS - (Date.now() - latest.createdAt.getTime()) / 1000) : 0;
  if (waitSeconds > 0) {
    throw new AppError(429, `Please wait ${waitSeconds} seconds before requesting a new code`,
      { code: "RATE_LIMITED", details: { retryAfterSeconds: waitSeconds } });
  }

  const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
  await prisma.$transaction([
    prisma.emailOtp.updateMany({ where: { email, purpose: PURPOSE, consumedAt: null }, data: { expiresAt: new Date() } }),
    prisma.emailOtp.create({ data: { email, purpose: PURPOSE, codeHash: hashCode(email, code),
      expiresAt: new Date(Date.now() + OTP_TTL_MINUTES * 60_000) } }),
  ]);

  const mail = renderEmail({
    preheader: `${code} is your Deutsch Sprache RW verification code`,
    title: "Confirm your email address",
    greeting: input.firstName ? `Hallo ${input.firstName},` : "Hallo,",
    paragraphs: ["Thank you for registering with Deutsch Sprache RW. Enter this code on the sign-up page to confirm your email and create your student account:"],
    code,
    footnote: `The code expires in ${OTP_TTL_MINUTES} minutes. If you did not start a registration, you can ignore this email; no account is created without the code.`,
  });
  if (emailAvailable()) {
    try {
      await sendMail({ to: email, subject: `${code} is your verification code`, ...mail });
    } catch (error) {
      logger.error({ error, email }, "Registration code email could not be delivered");
      throw new AppError(503, "We could not send the code right now. Please try again in a moment.", { code: "EMAIL_UNAVAILABLE" });
    }
  } else {
    logger.warn({ email }, "Email is not configured; registration code is only returned in development");
  }
  return {
    email,
    expiresInSeconds: OTP_TTL_MINUTES * 60,
    resendAfterSeconds: RESEND_AFTER_SECONDS,
    ...(isProduction ? {} : { devCode: code }),
  };
}

/** Checks the newest live code. Wrong guesses count against it even though registration then fails. */
export async function verifyRegisterOtp(email: string, code: string): Promise<string> {
  const otp = await prisma.emailOtp.findFirst({
    where: { email, purpose: PURPOSE, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) throw badRequest("Your verification code has expired. Request a new one.");
  if (otp.attempts >= MAX_ATTEMPTS) throw badRequest("Too many incorrect attempts. Request a new code.");
  const matches = timingSafeEqual(Buffer.from(otp.codeHash, "hex"), Buffer.from(hashCode(email, code), "hex"));
  if (!matches) {
    const { attempts } = await prisma.emailOtp.update({ where: { id: otp.id }, data: { attempts: { increment: 1 } } });
    const left = MAX_ATTEMPTS - attempts;
    throw badRequest(left > 0 ? `That code is not correct. ${left} ${left === 1 ? "attempt" : "attempts"} left.` : "Too many incorrect attempts. Request a new code.");
  }
  return otp.id;
}

/** Burns the code inside the account-creation transaction so it can never create two accounts. */
export async function consumeRegisterOtp(tx: Prisma.TransactionClient, otpId: string): Promise<void> {
  const used = await tx.emailOtp.updateMany({ where: { id: otpId, consumedAt: null }, data: { consumedAt: new Date() } });
  if (!used.count) throw badRequest("This code was already used. Request a new one.");
}
