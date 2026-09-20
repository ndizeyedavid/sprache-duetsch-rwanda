import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env, smtpEnabled, smtpFrom } from "../config/env.js";
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

const sendViaRelay = async (opts: { to: string; subject: string; html: string; text?: string; replyTo?: string }): Promise<boolean> => {
  const url = env.EMAIL_RELAY_URL;
  if (!url) return false;
  const endpoint = url.replace(/\/$/, "") + "/send";
  logger.info({ to: opts.to, endpoint }, "SMTP blocked — forwarding to VPS relay over HTTPS");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(env.EMAIL_RELAY_SECRET ? { "x-relay-secret": env.EMAIL_RELAY_SECRET } : {}),
    },
    body: JSON.stringify(opts),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Relay failed ${res.status}: ${body.slice(0, 500)}`);
  }
  logger.info({ to: opts.to }, "Email sent via VPS relay");
  return true;
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
    // No SMTP configured — try relay
    if (await sendViaRelay(opts)) return;
    logger.warn({ to: opts.to, subject: opts.subject }, "SMTP not configured — email skipped (set SMTP_USER/SMTP_PASS or EMAIL_RELAY_URL)");
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
      // Try 465 fallback first (if not already on 465), then VPS relay
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
          logger.warn({ fbCode, to: opts.to }, "465 fallback also failed — trying VPS relay");
        }
      }
      if (env.EMAIL_RELAY_URL) {
        await sendViaRelay(opts);
        return;
      }
      logger.error(
        { code, host: env.SMTP_HOST, port: env.SMTP_PORT },
        "SMTP blocked on Render (ETIMEDOUT/ENETUNREACH). Set EMAIL_RELAY_URL to your VPS relay — see email-relay/README.md",
      );
    }
    throw err;
  }
};
