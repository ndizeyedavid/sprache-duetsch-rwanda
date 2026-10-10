import { Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { createPaymentTx } from "../payments/payment-commands.js";
import type { PaypackTransaction } from "./paypack.schema.js";

export const settleCheckout = (data: PaypackTransaction) => transact(async tx => {
  const checkout = await tx.paymentCheckout.findUnique({ where: { providerRef: data.ref } });
  if (!checkout) return null; // The durable webhook inbox will retry after cashin returns.
  if (!checkout.amount.equals(new Prisma.Decimal(data.amount)) || checkout.phone !== data.client || data.kind !== "CASHIN") {
    throw badRequest("Paypack transaction does not match the checkout");
  }
  if (checkout.status === "SUCCESSFUL") return checkout;
  if (data.status === "pending") return checkout;
  if (data.status === "failed") {
    return tx.paymentCheckout.update({ where: { id: checkout.id }, data: { status: "FAILED" } });
  }
  // Dedicated method is stable even when a manual mobile-money method is disabled.
  const method = await tx.paymentMethodConfig.upsert({ where: { code: "PAYPACK" },
    create: { code: "PAYPACK", name: "Mobile money via Paypack", requiresReference: true }, update: {} });
  // Record real money even if finance disabled the method after initiation.
  const wasActive = method.isActive;
  if (!wasActive) await tx.paymentMethodConfig.update({ where: { id: method.id }, data: { isActive: true } });
  const payment = await createPaymentTx(tx, {
    studentId: checkout.studentId, methodId: method.id, amount: checkout.amount.toNumber(),
    currency: "RWF", reference: data.ref, idempotencyKey: `paypack:${checkout.id}`,
    notes: "Confirmed by Paypack",
  }, undefined, true);
  if (!wasActive) await tx.paymentMethodConfig.update({ where: { id: method.id }, data: { isActive: false } });
  return tx.paymentCheckout.update({ where: { id: checkout.id }, data: { status: "SUCCESSFUL", paymentId: payment.id } });
});
