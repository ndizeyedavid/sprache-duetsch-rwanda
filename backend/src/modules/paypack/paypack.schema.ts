import { z } from "zod";

export const normalizePhone = (value: string): string => {
  const phone = value.replace(/[\s()-]/g, "");
  return phone.replace(/^(?:\+?250|00250)/, "0");
};
export const phoneSchema = z.string().transform(normalizePhone)
  .pipe(z.string().regex(/^07[2389]\d{7}$/, "Enter a valid MTN or Airtel Rwanda mobile-money number"));
export const checkoutSchema = z.object({
  amount: z.number().int().min(100).max(999999999),
  phone: phoneSchema,
  requestKey: z.string().uuid(),
}).strict();
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export const transactionSchema = z.object({
  ref: z.string().min(1).max(200), kind: z.literal("CASHIN"),
  amount: z.number().finite().positive(), client: phoneSchema,
  created_at: z.string().datetime({ offset: true }).optional(),
  status: z.enum(["successful", "success", "failed", "pending"]),
});
export const eventSchema = z.object({
  event_id: z.string().min(1).max(200),
  kind: z.literal("transaction:processed"), data: transactionSchema,
});
export type PaypackTransaction = z.infer<typeof transactionSchema>;
