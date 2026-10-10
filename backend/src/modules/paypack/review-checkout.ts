import { writeAuditTx } from "../../lib/audit.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { findTransaction } from "./paypack-client.js";
import { settleCheckout } from "./settle-checkout.js";

export async function reconcileCheckout(id: string, reference: string, reason: string, actorId: string) {
  const transaction = await findTransaction(reference);
  if (!transaction) throw badRequest("No processed Paypack transaction was found");
  await transact(async tx => {
    const before = await tx.paymentCheckout.findUnique({ where: { id } });
    if (!before) throw notFound();
    if (before.providerRef && before.providerRef !== reference) throw conflict("This checkout already has another provider reference");
    if (!before.amount.equals(transaction.amount) || before.phone !== transaction.client ||
      !transaction.created_at || new Date(transaction.created_at).getTime() < before.createdAt.getTime() - 5000) {
      throw badRequest("Paypack transaction phone, amount or creation time does not match the request");
    }
    const after = await tx.paymentCheckout.update({ where: { id }, data: { providerRef: reference } });
    await writeAuditTx(tx, { actorId, action: "PAYPACK_RECONCILED", entityType: "PaymentCheckout", entityId: id, before, after, reason });
  });
  return settleCheckout(transaction);
}

// Finance must first check the provider dashboard/history: a transport error alone is never a failed payment.
export const closeUnsubmittedCheckout = (id: string, reason: string, actorId: string) => transact(async tx => {
  const before = await tx.paymentCheckout.findUnique({ where: { id } });
  if (!before) throw notFound();
  if (before.status !== "UNKNOWN" || before.providerRef || before.paymentId) {
    throw badRequest("Only an unconfirmed request with no provider reference can be closed");
  }
  if (Date.now() - before.createdAt.getTime() < 120000) throw conflict("Wait at least two minutes and verify the Paypack dashboard before closing this request");
  const after = await tx.paymentCheckout.update({ where: { id }, data: { status: "FAILED" } });
  await writeAuditTx(tx, { actorId, action: "PAYPACK_NO_DEBIT_CONFIRMED", entityType: "PaymentCheckout", entityId: id, before, after, reason });
  return after;
});
