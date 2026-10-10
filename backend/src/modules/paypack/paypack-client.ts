import { z } from "zod";
import { env } from "../../config/env.js";
import { AppError } from "../../lib/http-error.js";
import { transactionSchema } from "./paypack.schema.js";

const BASE_URL = "https://payments.paypack.rw/api";
export const paypackEnabled = (): boolean => env.PAYPACK_ENABLED === "true";
export const assertPaypackEnabled = (): void => {
  if (!paypackEnabled()) throw new AppError(503, "Online payments are not available yet. Please contact finance.");
};
let cachedToken: { access: string; until: number } | undefined;
let authorizing: Promise<string> | undefined;

async function authorize(): Promise<string> {
  const response = await fetch(`${BASE_URL}/auth/agents/authorize`, {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: env.PAYPACK_CLIENT_ID, client_secret: env.PAYPACK_CLIENT_SECRET }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new AppError(502, "Payment provider authentication failed. Please contact finance.");
  const { access } = z.object({ access: z.string().min(1) }).parse(await response.json());
  // Reauthorize well before the documented 15-minute expiry; no token is persisted or exposed.
  cachedToken = { access, until: Date.now() + 10 * 60 * 1000 };
  return access;
}
async function token(): Promise<string> {
  if (cachedToken && cachedToken.until > Date.now()) return cachedToken.access;
  authorizing ??= authorize().finally(() => { authorizing = undefined; });
  return authorizing;
}
async function request(path: string, init: RequestInit = {}): Promise<unknown> {
  assertPaypackEnabled();
  try {
    const send = async (): Promise<Response> => fetch(`${BASE_URL}${path}`, {
      ...init, signal: AbortSignal.timeout(20000), headers: {
        Accept: "application/json", "Content-Type": "application/json",
        Authorization: `Bearer ${await token()}`, "X-Webhook-Mode": env.PAYPACK_WEBHOOK_MODE, ...init.headers,
      },
    });
    let response = await send();
    if (response.status === 401) { cachedToken = undefined; response = await send(); }
    if (!response.ok) throw new AppError(502, "Paypack could not confirm this request. Check its status before paying again.");
    return await response.json();
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(502, "Payment provider is temporarily unavailable. Check payment status before trying again.");
  }
}
export async function requestCashin(amount: number, phone: string, requestKey: string) {
  const result = await request("/transactions/cashin", {
    method: "POST", headers: { "Idempotency-Key": requestKey.replaceAll("-", "") },
    body: JSON.stringify({ amount, number: phone }),
  });
  return z.object({ ref: z.string().min(1), amount: z.number(), kind: z.literal("CASHIN") }).parse(result);
}
export async function findTransaction(ref: string) {
  const result = await request(`/events/transactions?ref=${encodeURIComponent(ref)}&kind=CASHIN`);
  const { transactions } = z.object({ transactions: z.array(z.object({
    event_kind: z.string(), data: z.unknown(),
  })) }).parse(result);
  for (const event of transactions) {
    const parsed = transactionSchema.safeParse(event.data);
    if (event.event_kind === "transaction:processed" && parsed.success && parsed.data.ref === ref) return parsed.data;
  }
  return null;
}
