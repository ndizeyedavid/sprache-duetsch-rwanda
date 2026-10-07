import { createHmac, randomUUID } from "node:crypto";
import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { checkoutSchema } from "./paypack.schema.js";

vi.mock("../../config/env.js", () => ({ env: { PAYPACK_ENABLED: "true", PAYPACK_WEBHOOK_SECRET: "test-secret" } }));
vi.mock("./webhook-inbox.js", () => ({ acceptWebhook: vi.fn() }));
const { paypackWebhookRouter, verifySignature } = await import("./webhook.routes.js");
const { acceptWebhook } = await import("./webhook-inbox.js");
const app = express();
app.use("/webhook", paypackWebhookRouter);
app.use((err: { statusCode?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.sendStatus(err.statusCode ?? 500);
});

describe("Paypack validation and callback security", () => {
  it("normalizes Rwanda numbers and rejects unsupported numbers and fractional money", () => {
    for (const phone of ["0781234567", "+250781234567", "250781234567", "00250781234567"]) {
      expect(checkoutSchema.parse({ phone, amount: 100, requestKey: randomUUID() }).phone).toBe("0781234567");
    }
    for (const phone of ["0711234567", "078123", "+254781234567"]) {
      expect(checkoutSchema.safeParse({ phone, amount: 100, requestKey: randomUUID() }).success).toBe(false);
    }
    expect(checkoutSchema.safeParse({ phone: "0781234567", amount: 100.5, requestKey: randomUUID() }).success).toBe(false);
  });
  it("requires a matching HMAC of the exact raw bytes", () => {
    const body = Buffer.from('{ "amount": 100 }');
    const signature = createHmac("sha256", "test-secret").update(body).digest("base64");
    expect(verifySignature(body, signature, "test-secret")).toBe(true);
    expect(verifySignature(Buffer.from('{"amount":100}'), signature, "test-secret")).toBe(false);
    expect(verifySignature(body, undefined, "test-secret")).toBe(false);
    expect(verifySignature(body, "bad", "test-secret")).toBe(false);
  });
  it("allows HEAD availability checks and rejects unsigned POSTs", async () => {
    await request(app).head("/webhook").expect(200);
    await request(app).post("/webhook").send({ data: {} }).expect(401);
    expect(acceptWebhook).not.toHaveBeenCalled();
  });
  it("accepts signed POSTs without needing a student bearer token", async () => {
    const body = '{ "event_id": "test" }';
    const signature = createHmac("sha256", "test-secret").update(body).digest("base64");
    await request(app).post("/webhook").set("Content-Type", "application/json")
      .set("x-paypack-signature", signature).send(body).expect(200);
    expect(acceptWebhook).toHaveBeenCalledWith({ event_id: "test" });
  });
});
