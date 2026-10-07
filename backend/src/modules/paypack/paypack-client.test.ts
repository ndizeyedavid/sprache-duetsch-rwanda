import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("../../config/env.js", () => ({ env: {
  PAYPACK_ENABLED: "true", PAYPACK_CLIENT_ID: "client", PAYPACK_CLIENT_SECRET: "secret", PAYPACK_WEBHOOK_MODE: "development",
} }));
beforeEach(() => vi.resetModules());
afterEach(() => vi.unstubAllGlobals());
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
describe("Paypack server client", () => {
  it("authenticates, keeps secrets off cashin calls and uses a 32-character retry key", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ access: "token" }))
      .mockResolvedValueOnce(json({ ref: "reference", amount: 100, kind: "CASHIN" }));
    vi.stubGlobal("fetch", fetcher);
    const { requestCashin } = await import("./paypack-client.js");
    await requestCashin(100, "0781234567", "12345678-1234-1234-1234-123456789012");
    expect(fetcher.mock.calls[0]?.[1]?.body).toBe(JSON.stringify({ client_id: "client", client_secret: "secret" }));
    expect(fetcher.mock.calls[1]?.[1]?.headers).toMatchObject({ "Idempotency-Key": "12345678123412341234123456789012", Authorization: "Bearer token", "X-Webhook-Mode": "development" });
    expect(fetcher.mock.calls[1]?.[1]?.body).toBe(JSON.stringify({ amount: 100, number: "0781234567" }));
  });
  it("reauthenticates once on token expiry while preserving the same cashin key", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ access: "old" }))
      .mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json({ access: "new" }))
      .mockResolvedValueOnce(json({ ref: "reference", amount: 100, kind: "CASHIN" }));
    vi.stubGlobal("fetch", fetcher);
    const { requestCashin } = await import("./paypack-client.js");
    await requestCashin(100, "0781234567", "same-key");
    expect(fetcher.mock.calls[3]?.[1]?.headers).toMatchObject({ "Idempotency-Key": "samekey", Authorization: "Bearer new" });
  });
  it("does not retry a timeout or expose provider error details", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(json({ access: "token" })).mockRejectedValueOnce(new Error("secret-provider-detail"));
    vi.stubGlobal("fetch", fetcher);
    const { requestCashin } = await import("./paypack-client.js");
    await expect(requestCashin(100, "0781234567", "key")).rejects.toThrow("temporarily unavailable");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
