import { env } from "../../config/env.js";
import { Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { createPaymentTx } from "../payments/payment-commands.js";
import { samePhone } from "./mobile-money.schema.js";
import type { XendlyPayment } from "./mobile-money.schema.js";

export const GATEWAY_METHOD_CODE = "XENDLYPAY";
export const GATEWAY_PROVIDER = "XENDLYPAY";

const failureText = (data: XendlyPayment): string => data.failure_message?.trim()
  || (data.status === "cancelled" ? "The payment was cancelled on the phone." : "The payment was not approved.");

/** Everything XendlyPay tells us must agree with the request we sent before money is credited. */
function mismatch(checkout: { id: string; amount: Prisma.Decimal; phone: string; providerRef: string | null }, data: XendlyPayment): string | null {
  if (checkout.providerRef && checkout.providerRef !== data.id) return "a different XendlyPay payment id";
  if (data.reference && data.reference !== checkout.id) return "a different reference";
  if (!checkout.amount.equals(new Prisma.Decimal(data.amount))) return "a different amount";
  if (data.msisdn && !samePhone(data.msisdn, checkout.phone)) return "a different phone number";
  if (data.direction && data.direction !== "collect") return "a payout, not a collection";
  if (data.currency && data.currency !== "RWF") return "a currency other than RWF";
  if (data.mode && data.mode !== env.XENDLYPAY_MODE) return `${data.mode} mode while this platform credits ${env.XENDLYPAY_MODE} payments only`;
  return null;
}

/**
 * Applies a XendlyPay payment to its checkout. Idempotent and safe under concurrency: duplicate webhooks,
 * polling and finance reconciliation all end in one ledger payment and one receipt.
 * Returns null when the payment belongs to no checkout of ours (e.g. one taken from the XendlyPay dashboard).
 */
export const settleCheckout = (data: XendlyPayment) => transact(async tx => {
  const checkout = data.reference
    ? await tx.paymentCheckout.findUnique({ where: { id: data.reference } })
    : await tx.paymentCheckout.findUnique({ where: { providerRef: data.id } });
  if (!checkout || checkout.provider !== GATEWAY_PROVIDER) return null;
  const problem = mismatch(checkout, data);
  if (problem) throw badRequest(`XendlyPay payment does not match the checkout: ${problem}`);
  if (checkout.status === "SUCCESSFUL") return checkout;
  // Deliveries can arrive out of order: "pending" only ever moves a request forward, never reopens a closed one.
  if (data.status === "pending") {
    const reopen = checkout.status === "INITIATING" || checkout.status === "UNKNOWN";
    return tx.paymentCheckout.update({ where: { id: checkout.id }, data: { providerRef: data.id, ...(reopen ? { status: "PENDING" as const } : {}) } });
  }
  if (data.status === "failed" || data.status === "cancelled") {
    return tx.paymentCheckout.update({ where: { id: checkout.id },
      data: { providerRef: data.id, status: "FAILED", failureReason: failureText(data) } });
  }
  // "succeeded" is final at XendlyPay, so it also overrides a request we had closed as failed: the money moved.
  const method = await tx.paymentMethodConfig.upsert({ where: { code: GATEWAY_METHOD_CODE },
    create: { code: GATEWAY_METHOD_CODE, name: "Mobile money via XendlyPay", requiresReference: true }, update: {} });
  // Record real money even if finance disabled the method after the student started paying.
  const wasActive = method.isActive;
  if (!wasActive) await tx.paymentMethodConfig.update({ where: { id: method.id }, data: { isActive: true } });
  const payment = await createPaymentTx(tx, {
    studentId: checkout.studentId, methodId: method.id, amount: checkout.amount.toNumber(),
    currency: "RWF", reference: data.xendly_reference?.trim() || data.id, idempotencyKey: `xendlypay:${checkout.id}`,
    notes: `Confirmed by XendlyPay (payment ${data.id})`,
  }, undefined, true);
  if (!wasActive) await tx.paymentMethodConfig.update({ where: { id: method.id }, data: { isActive: false } });
  return tx.paymentCheckout.update({ where: { id: checkout.id },
    data: { status: "SUCCESSFUL", providerRef: data.id, paymentId: payment.id, failureReason: null } });
});
