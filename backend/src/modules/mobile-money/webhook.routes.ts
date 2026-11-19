import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import express, { Router } from "express";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { AppError, badRequest, unauthorized } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { webhookEventSchema } from "./mobile-money.schema.js";
import { acceptWebhook, processEvent } from "./webhook-inbox.js";
import { xendlyEnabled } from "./xendly-client.js";

const TOLERANCE_SECONDS = 300;

/**
 * X-Xendly-Signature: t=<unix seconds>,v1=<hex HMAC-SHA256(secret, t + "." + raw body)>.
 * Constant-time compare, and deliveries older than five minutes are refused so a captured one cannot be replayed.
 */
export function verifySignature(raw: Buffer, header: string | undefined, secret: string, nowMs = Date.now()): boolean {
  if (!header || !secret) return false;
  const pairs = header.split(",").map(part => part.trim().split("=", 2) as [string, string | undefined]);
  const timestamp = pairs.find(([key]) => key === "t")?.[1];
  const signatures = pairs.filter(([key, value]) => key === "v1" && value).map(([, value]) => value!);
  if (!timestamp || !/^\d+$/.test(timestamp) || !signatures.length) return false;
  if (Math.abs(nowMs / 1000 - Number(timestamp)) > TOLERANCE_SECONDS) return false;
  const expected = Buffer.from(createHmac("sha256", secret).update(`${timestamp}.`).update(raw).digest("hex"));
  return signatures.some(signature => {
    const supplied = Buffer.from(signature.toLowerCase());
    return supplied.length === expected.length && timingSafeEqual(expected, supplied);
  });
}

export const xendlyWebhookRouter = Router();
xendlyWebhookRouter.head("/", (_req, res) => { res.sendStatus(200); });
xendlyWebhookRouter.post("/", express.raw({ type: () => true, limit: "256kb" }), asyncHandler(async (req, res) => {
  // 503 makes XendlyPay retry (for about a day), so nothing is lost while the secret is being configured.
  if (!xendlyEnabled()) throw new AppError(503, "Mobile money is not enabled");
  const secret = env.XENDLYPAY_WEBHOOK_SECRET?.trim();
  if (!secret) throw new AppError(503, "XendlyPay webhook secret is not configured yet");
  const raw = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
  if (!verifySignature(raw, req.get("x-xendly-signature"), secret)) throw unauthorized("Invalid XendlyPay signature");
  let event;
  try { event = webhookEventSchema.parse(JSON.parse(raw.toString("utf8"))); }
  catch { throw badRequest("Malformed XendlyPay event"); }
  const deliveryId = req.get("x-xendly-delivery")?.trim().slice(0, 200) || `sha256:${createHash("sha256").update(raw).digest("hex")}`;
  const stored = await acceptWebhook(deliveryId, event);
  // Answer fast (XendlyPay times out after 15 s); the stored event is applied right after, or by the reconciler.
  res.json({ success: true });
  if (stored) setImmediate(() => { processEvent(deliveryId).catch((err: unknown) => logger.warn({ deliveryId, err }, "XendlyPay event deferred")); });
}));
