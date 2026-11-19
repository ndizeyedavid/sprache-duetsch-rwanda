import { createHmac } from "node:crypto";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { checkoutSchema } from "./mobile-money.schema.js";

vi.mock("../../config/env.js", () => ({ env: { XENDLYPAY_ENABLED: "true", XENDLYPAY_API_KEY: "xpay_a_b", XENDLYPAY_WEBHOOK_SECRET: "test-secret" } }));
vi.mock("../../lib/logger.js", () => ({ logger: { warn: vi.fn(), error: vi.fn(), info: vi.fn() } }));
vi.mock("./webhook-inbox.js", () => ({ acceptWebhook: vi.fn().mockResolvedValue(false), processEvent: vi.fn() }));
const { xendlyWebhookRouter, verifySignature } = await import("./webhook.routes.js");
const { acceptWebhook } = await import("./webhook-inbox.js");
const app = express();
app.use("/webhook", xendlyWebhookRouter);
app.use((err: { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.sendStatus(err.statusCode ?? 500);
});
const sign = (body: string, t = Math.floor(Date.now() / 1000), secret = "test-secret") =>
  `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${body}`).digest("hex")}`;

describe("XendlyPay validation and callback security", () => {
  it("normalizes Rwanda numbers and rejects unsupported numbers and fractional money", () => {
    for (const phone of ["0781234567", "+250781234567", "250781234567", "00250781234567", "+250 781 234 567"]) {
      expect(checkoutSchema.parse({ phone, amount: 100, requestKey: crypto.randomUUID() }).phone).toBe("0781234567");
    }
    for (const phone of ["0711234567", "078123", "+254781234567"]) {
      expect(checkoutSchema.safeParse({ phone, amount: 100, requestKey: crypto.randomUUID() }).success).toBe(false);
    }
    expect(checkoutSchema.safeParse({ phone: "0781234567", amount: 100.5, requestKey: crypto.randomUUID() }).success).toBe(false);
  });
  it("verifies t + '.' + the exact raw bytes, constant time, within five minutes", () => {
    const body = '{ "type": "ping" }';
    expect(verifySignature(Buffer.from(body), sign(body), "test-secret")).toBe(true);
    expect(verifySignature(Buffer.from('{"type":"ping"}'), sign(body), "test-secret")).toBe(false);
    expect(verifySignature(Buffer.from(body), sign(body, Math.floor(Date.now() / 1000) - 301), "test-secret")).toBe(false);
    expect(verifySignature(Buffer.from(body), sign(body, undefined, "other"), "test-secret")).toBe(false);
    expect(verifySignature(Buffer.from(body), undefined, "test-secret")).toBe(false);
    expect(verifySignature(Buffer.from(body), "t=abc,v1=00", "test-secret")).toBe(false);
  });
  it("rejects unsigned deliveries and accepts signed ones without a user token", async () => {
    await request(app).head("/webhook").expect(200);
    await request(app).post("/webhook").set("Content-Type", "application/json").send('{"type":"ping","data":{}}').expect(401);
    expect(acceptWebhook).not.toHaveBeenCalled();
    const body = '{"type":"ping","data":{"message":"hi"}}';
    await request(app).post("/webhook").set("Content-Type", "application/json").set("X-Xendly-Signature", sign(body))
      .set("X-Xendly-Delivery", "dlv_1").send(body).expect(200);
    expect(acceptWebhook).toHaveBeenCalledWith("dlv_1", { type: "ping", data: { message: "hi" } });
  });
});
