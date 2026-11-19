import { z } from "zod";

/** Stored form of a Rwanda mobile-money number: 07XXXXXXXX. */
export const normalizePhone = (value: string): string => {
  const phone = value.replace(/[\s()-]/g, "");
  return phone.replace(/^(?:\+?250|00250)/, "0");
};
/** XendlyPay's form of the same number: 2507XXXXXXXX. */
export const toMsisdn = (phone: string): string => `250${normalizePhone(phone).slice(1)}`;
export const samePhone = (a: string, b: string): boolean => normalizePhone(a) === normalizePhone(b);

// MTN 078/079 and Airtel 072/073: the only prefixes XendlyPay can route.
export const phoneSchema = z.string().transform(normalizePhone)
  .pipe(z.string().regex(/^07[2389]\d{7}$/, "Enter a valid MTN or Airtel Rwanda mobile-money number"));

export const checkoutSchema = z.object({
  amount: z.number().int().min(100).max(999999999),
  phone: phoneSchema,
  requestKey: z.string().uuid(),
}).strict();
export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** A XendlyPay payment object (POST/GET /v1/payments and every webhook `data`). Unknown fields are ignored. */
export const xendlyPaymentSchema = z.object({
  id: z.string().min(1).max(200),
  status: z.enum(["pending", "succeeded", "failed", "cancelled"]),
  amount: z.number().int().positive(),
  currency: z.string().optional(),
  msisdn: z.string().optional(),
  direction: z.string().optional(),
  mode: z.enum(["test", "live"]).optional(),
  reference: z.string().nullable().optional(),
  failure_message: z.string().nullable().optional(),
  xendly_reference: z.string().nullable().optional(),
  created_at: z.string().optional(),
});
export type XendlyPayment = z.infer<typeof xendlyPaymentSchema>;

export const webhookEventSchema = z.object({ type: z.string().min(1).max(100), data: z.unknown() });
export type WebhookEvent = z.infer<typeof webhookEventSchema>;

/** Only these events move money into a student's account; everything else (ping, payouts, new types) is acknowledged and ignored. */
export const PAYMENT_EVENTS = new Set(["payment.succeeded", "payment.failed"]);
