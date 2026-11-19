import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { AppError, badRequest, conflict, notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { samePhone } from "./mobile-money.schema.js";
import { GATEWAY_PROVIDER, settleCheckout } from "./settle-checkout.js";
import { GatewayRefusal, getXendlyPayment } from "./xendly-client.js";

/** Finance links an unclear request to the XendlyPay payment it found in the dashboard; every detail must match. */
export async function reconcileCheckout(id: string, paymentId: string, reason: string, actorId: string) {
  let payment;
  try { payment = await getXendlyPayment(paymentId); }
  catch (error) {
    if (error instanceof GatewayRefusal) throw badRequest("No XendlyPay payment with this id was found for this app");
    throw new AppError(503, "XendlyPay is not answering right now. Try again shortly.");
  }
  await transact(async tx => {
    const before = await tx.paymentCheckout.findUnique({ where: { id } });
    if (!before) throw notFound();
    if (before.provider !== GATEWAY_PROVIDER) throw badRequest("Only XendlyPay requests can be reconciled here");
    if (before.providerRef && before.providerRef !== payment.id) throw conflict("This request already has another XendlyPay payment");
    const tooEarly = !payment.created_at || new Date(payment.created_at).getTime() < before.createdAt.getTime() - 5000;
    if (!before.amount.equals(new Prisma.Decimal(payment.amount)) || (payment.msisdn && !samePhone(payment.msisdn, before.phone)) || tooEarly
      || (payment.reference && payment.reference !== before.id)) {
      throw badRequest("The XendlyPay payment's phone, amount, reference or creation time does not match this request");
    }
    const after = await tx.paymentCheckout.update({ where: { id }, data: { providerRef: payment.id } });
    await writeAuditTx(tx, { actorId, action: "MOBILE_MONEY_RECONCILED", entityType: "PaymentCheckout", entityId: id, before, after, reason });
  });
  return settleCheckout(payment);
}

// Finance must first check the XendlyPay dashboard and the payer's history: a transport error alone is never a failed payment.
export const closeUnsubmittedCheckout = (id: string, reason: string, actorId: string) => transact(async tx => {
  const before = await tx.paymentCheckout.findUnique({ where: { id } });
  if (!before) throw notFound();
  if (before.status !== "UNKNOWN" || before.providerRef || before.paymentId) {
    throw badRequest("Only an unconfirmed request with no XendlyPay payment can be closed");
  }
  if (Date.now() - before.createdAt.getTime() < 120000) throw conflict("Wait at least two minutes and check the XendlyPay dashboard before closing this request");
  const after = await tx.paymentCheckout.update({ where: { id }, data: { status: "FAILED", failureReason: "Closed by finance: no payment was taken." } });
  await writeAuditTx(tx, { actorId, action: "MOBILE_MONEY_NO_DEBIT_CONFIRMED", entityType: "PaymentCheckout", entityId: id, before, after, reason });
  return after;
});
