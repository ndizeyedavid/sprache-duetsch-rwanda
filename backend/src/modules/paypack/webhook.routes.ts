import { createHmac, timingSafeEqual } from "node:crypto";
import express, { Router } from "express";
import { env } from "../../config/env.js";
import { asyncHandler } from "../../lib/async-handler.js";
import { unauthorized } from "../../lib/http-error.js";
import { assertPaypackEnabled } from "./paypack-client.js";
import { acceptWebhook } from "./webhook-inbox.js";

export function verifySignature(body: Buffer, signature: string | undefined, secret: string): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest("base64");
  const supplied = Buffer.from(signature);
  return supplied.length === expected.length && timingSafeEqual(Buffer.from(expected), supplied);
}
export const paypackWebhookRouter = Router();
// Paypack checks availability with HEAD before delivering a callback.
paypackWebhookRouter.head("/", (_req, res) => { res.sendStatus(200); });
paypackWebhookRouter.post("/", express.raw({ type: "application/json", limit: "64kb" }), asyncHandler(async (req, res) => {
  assertPaypackEnabled();
  if (!Buffer.isBuffer(req.body) || !verifySignature(req.body, req.get("x-paypack-signature"), env.PAYPACK_WEBHOOK_SECRET ?? "")) {
    throw unauthorized("Invalid Paypack signature");
  }
  await acceptWebhook(JSON.parse(req.body.toString("utf8")) as unknown);
  res.json({ success: true });
}));
