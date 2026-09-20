import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env, smtpEnabled, smtpFrom } from "../config/env.js";
import { logger } from "./logger.js";

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (!smtpEnabled) return null;
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE === "true",
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
};

export const verifyMailer = async (): Promise<boolean> => {
  const t = getTransporter();
  if (!t) return false;
  try {
    await t.verify();
    logger.info("SMTP transporter verified");
    return true;
  } catch (err) {
    logger.error({ err }, "SMTP verify failed");
    return false;
  }
};

export const sendMail = async (opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}): Promise<void> => {
  const t = getTransporter();
  if (!t) {
    logger.warn({ to: opts.to, subject: opts.subject }, "SMTP not configured — email skipped (set SMTP_USER/SMTP_PASS)");
    return;
  }
  await t.sendMail({
    from: smtpFrom,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    replyTo: opts.replyTo,
  });
};
