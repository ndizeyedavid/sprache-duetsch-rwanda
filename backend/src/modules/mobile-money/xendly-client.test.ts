import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../config/env.js", () => ({ env: { XENDLYPAY_ENABLED: "true", XENDLYPAY_API_KEY: "xpay_abc123_secretpart" } }));
beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
const payment = { id: "0f8c2b7e-1a45-4c31-9d02-6e8f1b2c3d44", status: "pending", amount: 5000, msisdn: "250781234567", reference: "checkout-id" };

describe("XendlyPay server client", () => {
  it("sends the key as a bearer token, a stable idempotency key and the 250 msisdn form", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ success: true, payload: payment }, 201));
    vi.stubGlobal("fetch", fetcher);
    const { createXendlyPayment } = await import("./xendly-client.js");
    const result = await createXendlyPayment({ checkoutId: "checkout-id", amount: 5000, phone: "0781234567", description: "Tuition" });
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.xendlypay.com/v1/payments");
    expect(init?.headers).toMatchObject({ Authorization: "Bearer xpay_abc123_secretpart", "Idempotency-Key": "checkout-checkout-id" });
    expect(JSON.parse(init?.body as string)).toMatchObject({ amount: 5000, currency: "RWF", msisdn: "250781234567", reference: "checkout-id" });
    expect(result.id).toBe(payment.id);
  });
  it("treats a 4xx as a refusal with XendlyPay's message and a timeout or 5xx as unknown", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ status: "error", message: "250781234567 is not one of your test numbers" }, 400))
      .mockRejectedValueOnce(new Error("socket hang up"))
      .mockResolvedValueOnce(json({ status: "error", message: "gateway" }, 502)));
    const { createXendlyPayment, GatewayRefusal, GatewayUnavailable } = await import("./xendly-client.js");
    const input = { checkoutId: "c", amount: 100, phone: "0781234567", description: "x" };
    const refused = await createXendlyPayment(input).catch((error: unknown) => error);
    expect(refused).toBeInstanceOf(GatewayRefusal);
    expect((refused as Error).message).toMatch(/test numbers/);
    await expect(createXendlyPayment(input)).rejects.toBeInstanceOf(GatewayUnavailable);
    await expect(createXendlyPayment(input)).rejects.toBeInstanceOf(GatewayUnavailable);
  });
  it("finds a lost request by its reference and reads the app mode", async () => {
    vi.stubGlobal("fetch", vi.fn<typeof fetch>()
      .mockResolvedValueOnce(json({ success: true, payload: { payments: [{ ...payment, reference: "other" }, payment], total: 2 } }))
      .mockResolvedValueOnce(json({ success: true, payload: { available: 0, currency: "RWF", mode: "test", pending: 0 } })));
    const { findXendlyPaymentByReference, xendlyAppMode } = await import("./xendly-client.js");
    expect((await findXendlyPaymentByReference("checkout-id", "0781234567", new Date()))?.id).toBe(payment.id);
    expect(await xendlyAppMode()).toBe("test");
  });
});
