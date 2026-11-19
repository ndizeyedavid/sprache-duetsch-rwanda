import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/http-error.js";
import { toMsisdn, xendlyPaymentSchema } from "./mobile-money.schema.js";
import type { XendlyPayment } from "./mobile-money.schema.js";

const BASE_URL = "https://api.xendlypay.com";
const MODE_TTL_MS = 5 * 60 * 1000;

export const xendlyEnabled = (): boolean => env.XENDLYPAY_ENABLED === "true" && Boolean(env.XENDLYPAY_API_KEY?.trim());
export const assertXendlyEnabled = (): void => {
  if (!xendlyEnabled()) throw new AppError(503, "Online payments are not available yet. Please contact finance.");
};

/** XendlyPay answered and refused: nothing was charged, so the request is safely final. */
export class GatewayRefusal extends Error {
  readonly status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
/** No usable answer (timeout, 5xx, garbled body): the payment may or may not exist. Never treat as failed. */
export class GatewayUnavailable extends Error {}

const errorBody = z.object({ message: z.string() }).partial();
const success = z.object({ success: z.literal(true), payload: z.unknown() });

async function call(path: string, init: RequestInit = {}): Promise<unknown> {
  assertXendlyEnabled();
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init, signal: AbortSignal.timeout(30000), headers: {
        Accept: "application/json", "Content-Type": "application/json",
        Authorization: `Bearer ${env.XENDLYPAY_API_KEY!.trim()}`, ...init.headers,
      },
    });
  } catch { throw new GatewayUnavailable("XendlyPay did not answer"); }
  const body: unknown = await response.json().catch(() => null);
  if (response.ok) {
    const parsed = success.safeParse(body);
    if (!parsed.success) throw new GatewayUnavailable("Unexpected XendlyPay response");
    return parsed.data.payload;
  }
  // 4xx are XendlyPay's documented "fix the request / not now" answers; nothing was recorded or charged.
  if (response.status >= 400 && response.status < 500) {
    const message = errorBody.safeParse(body).data?.message ?? `XendlyPay refused the request (${response.status})`;
    throw new GatewayRefusal(response.status, message);
  }
  throw new GatewayUnavailable(`XendlyPay error ${response.status}`);
}

/** Cash in. The Idempotency-Key is derived from the checkout, so a retry can never prompt the customer twice. */
export async function createXendlyPayment(input: { checkoutId: string; amount: number; phone: string; description: string }): Promise<XendlyPayment> {
  const payload = await call("/v1/payments", {
    method: "POST", headers: { "Idempotency-Key": `checkout-${input.checkoutId}` },
    body: JSON.stringify({
      amount: input.amount, currency: "RWF", msisdn: toMsisdn(input.phone), description: input.description,
      reference: input.checkoutId, metadata: { checkoutId: input.checkoutId },
    }),
  });
  return xendlyPaymentSchema.parse(payload);
}

export async function getXendlyPayment(id: string): Promise<XendlyPayment> {
  return xendlyPaymentSchema.parse(await call(`/v1/payments/${encodeURIComponent(id)}`));
}

/** Read-only lookup of a request whose create response was lost: our checkout id travels as `reference`. */
export async function findXendlyPaymentByReference(reference: string, phone: string, since: Date): Promise<XendlyPayment | null> {
  const from = new Date(since.getTime() - 86_400_000).toISOString().slice(0, 10);
  const query = new URLSearchParams({ status: "all", direction: "collect", msisdn: toMsisdn(phone), from, limit: "100" });
  const { payments } = z.object({ payments: z.array(z.unknown()) }).parse(await call(`/v1/payments?${query.toString()}`));
  for (const row of payments) {
    const parsed = xendlyPaymentSchema.safeParse(row);
    if (parsed.success && parsed.data.reference === reference) return parsed.data;
  }
  return null;
}

let modeCache: { mode: "test" | "live"; until: number } | undefined;
/** The XendlyPay app's current mode (test or live), read from the balance endpoint and cached briefly. */
export async function xendlyAppMode(): Promise<"test" | "live"> {
  if (modeCache && modeCache.until > Date.now()) return modeCache.mode;
  const { mode } = z.object({ mode: z.enum(["test", "live"]) }).parse(await call("/v1/balance?currency=RWF"));
  modeCache = { mode, until: Date.now() + MODE_TTL_MS };
  return mode;
}
export const resetXendlyModeCache = (): void => { modeCache = undefined; };
