import { randomUUID } from "node:crypto";
import type { XendlyPayment } from "./mobile-money.schema.js";

type Status = XendlyPayment["status"];
/** In-memory XendlyPay for integration tests: same envelopes, idempotency and lookups as the real API. */
export function fakeXendly() {
  const payments = new Map<string, XendlyPayment & { msisdn: string; reference: string | null }>();
  const byKey = new Map<string, string>();
  const state = { mode: "test" as "test" | "live", posts: 0, timeout: false, landBeforeTimeout: false, refuse: null as string | null,
    beforeReply: null as null | ((payment: XendlyPayment) => Promise<void>) };
  const ok = (payload: unknown, status = 200) => new Response(JSON.stringify({ success: true, payload, timestamp: new Date().toISOString() }), { status });
  const fail = (status: number, message: string) => new Response(JSON.stringify({ status: "error", message }), { status });
  const fetcher = async (input: string | URL | Request, init?: RequestInit): Promise<Response> => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url);
    if (url.pathname === "/v1/balance") return ok({ available: 0, pending: 0, currency: "RWF", mode: state.mode });
    if (url.pathname === "/v1/payments" && init?.method === "POST") {
      const key = new Headers(init.headers).get("Idempotency-Key") ?? "";
      const existing = byKey.get(key);
      if (existing) return ok(payments.get(existing), 200);
      state.posts++;
      if (state.refuse) return fail(400, state.refuse);
      const body = JSON.parse(init.body as string) as { amount: number; msisdn: string; reference: string };
      const create = () => {
        const payment = { id: randomUUID(), status: "pending" as Status, amount: body.amount, currency: "RWF", msisdn: body.msisdn,
          direction: "collect", mode: state.mode, reference: body.reference, xendly_reference: `XP-${payments.size + 1}`,
          created_at: new Date().toISOString(), failure_message: null };
        payments.set(payment.id, payment); byKey.set(key, payment.id);
        return payment;
      };
      if (state.timeout) { if (state.landBeforeTimeout) create(); throw new Error("Simulated lost response"); }
      const payment = create();
      if (state.beforeReply) await state.beforeReply({ ...payment, status: "succeeded" });
      return ok(payment, 201);
    }
    if (url.pathname === "/v1/payments") {
      const msisdn = url.searchParams.get("msisdn");
      const rows = [...payments.values()].filter(row => !msisdn || row.msisdn === msisdn);
      return ok({ payments: rows, total: rows.length });
    }
    const found = payments.get(url.pathname.replace("/v1/payments/", ""));
    return found ? ok(found) : fail(404, "No such transaction");
  };
  const set = (id: string, status: Status, failure_message: string | null = null) => {
    const row = payments.get(id)!; row.status = status; row.failure_message = failure_message; return { ...row };
  };
  return { state, payments, fetcher, set };
}
