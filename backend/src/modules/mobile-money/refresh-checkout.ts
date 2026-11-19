import { AppError } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getCheckoutFor, UNRESOLVED } from "./mobile-money.service.js";
import { GATEWAY_PROVIDER, settleCheckout } from "./settle-checkout.js";
import { findXendlyPaymentByReference, GatewayRefusal, getXendlyPayment } from "./xendly-client.js";

const CHECK_EVERY_MS = 15_000;
/** XendlyPay creates its payment row synchronously, so a request it never saw after this long was never sent. */
const NEVER_ARRIVED_AFTER_MS = 15 * 60_000;

/** Asks XendlyPay for the current state of an open request (at most every 15 seconds per request). */
export async function refreshCheckout(id: string, studentId?: string) {
  const checkout = await getCheckoutFor(id, studentId);
  const open = (UNRESOLVED as readonly string[]).includes(checkout.status);
  const due = !checkout.lastCheckedAt || Date.now() - checkout.lastCheckedAt.getTime() > CHECK_EVERY_MS;
  if (checkout.provider !== GATEWAY_PROVIDER || !open || !due) return checkout;
  const claimed = await prisma.paymentCheckout.updateMany({ where: { id, lastCheckedAt: checkout.lastCheckedAt }, data: { lastCheckedAt: new Date() } });
  if (!claimed.count) return prisma.paymentCheckout.findUniqueOrThrow({ where: { id } });
  try {
    const payment = checkout.providerRef
      ? await getXendlyPayment(checkout.providerRef)
      : await findXendlyPaymentByReference(checkout.id, checkout.phone, checkout.createdAt);
    if (payment) await settleCheckout(payment);
    else if (Date.now() - checkout.createdAt.getTime() > NEVER_ARRIVED_AFTER_MS) {
      await prisma.paymentCheckout.updateMany({ where: { id, status: { in: ["INITIATING", "UNKNOWN"] }, providerRef: null },
        data: { status: "FAILED", failureReason: "The request never reached XendlyPay, so no money was taken. You can pay again." } });
    }
  } catch (error) {
    if (error instanceof GatewayRefusal && error.status !== 404) throw new AppError(503, "Could not check the payment right now. Please try again shortly.");
    if (!(error instanceof GatewayRefusal)) throw new AppError(503, "Could not reach the payment provider. Please check again shortly.");
  }
  return prisma.paymentCheckout.findUniqueOrThrow({ where: { id } });
}
