import type { Transporter } from "nodemailer";
import nodemailer from "nodemailer";
import { env,smtpEnabled,smtpFrom } from "../config/env.js";
import { logger } from "./logger.js";

let transporter: Transporter | null = null;
let transporterKey: string | null = null;

const buildTransporter = (port: number, secure: boolean): Transporter =>
  nodemailer.createTransport({
    host: env.SMTP_HOST,
    port,
    secure,
    auth: { user: env.SMTP_USER!, pass: env.SMTP_PASS! },
    connectionTimeout: 20_000,
    greetingTimeout: 20_000,
    socketTimeout: 25_000,
    requireTLS: !secure && port === 587,
    tls: { minVersion: "TLSv1.2", servername: env.SMTP_HOST },
    logger: false,
  });

const getTransporter = (): Transporter | null => {
  if (!smtpEnabled) return null;
  const secure = env.SMTP_SECURE === "true";
  const port = env.SMTP_PORT;
  const key = `${env.SMTP_HOST}:${port}:${String(secure)}`;
  if (transporter && transporterKey === key) return transporter;
  transporter = buildTransporter(port, secure);
  transporterKey = key;
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
  const from = smtpFrom.includes("<") ? smtpFrom : `Deutsch Sprache RW <${smtpFrom}>`;
  const mail = { from, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text, replyTo: opts.replyTo };

  try {
    await t.sendMail(mail);
  } catch (err) {
    const code = (err as { code?: string })?.code;
    const isNetworkBlock = code === "ETIMEDOUT" || code === "ESOCKET" || code === "ENETUNREACH" || code === "ECONNECTION" || code === "ETLS" || code === "ECONNREFUSED";
    if (isNetworkBlock) {
      // Retry once on 465/SSL when the configured port is unreachable.
      const already465 = env.SMTP_PORT === 465 && env.SMTP_SECURE === "true";
      if (!already465 && (code === "ETIMEDOUT" || code === "ECONNECTION")) {
        try {
          logger.warn({ code, to: opts.to }, "SMTP 587 timed out — retrying once on 465/SSL");
          const fallback = buildTransporter(465, true);
          await fallback.sendMail(mail);
          transporter = fallback;
          transporterKey = `${env.SMTP_HOST}:465:true`;
          logger.info("SMTP fallback to 465/SSL succeeded");
          return;
        } catch (fallbackErr) {
          const fbCode = (fallbackErr as { code?: string })?.code;
          logger.warn({ fbCode, to: opts.to }, "465 fallback also failed");
        }
      }
      logger.error({ code, host: env.SMTP_HOST, port: env.SMTP_PORT }, "SMTP server unreachable");
    }
    throw err;
  }
};
