import { writeActivityTx } from "../activity/activity-transaction.js";
import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { generateReceiptNumber } from "../../lib/ids.js";
import { transact } from "../../lib/transactions.js";
import { ledgerContext,validateMethod } from "./ledger-context.js";
import type { CreatePaymentInput,DeletePaymentInput,UpdatePaymentInput } from "./payments.schema.js";

export const createPayment = (input: CreatePaymentInput, actorId?: string) => transact(tx => createPaymentTx(tx, input, actorId));

export const createPaymentTx = async (tx: Prisma.TransactionClient, input: CreatePaymentInput, actorId?: string, gatewayConfirmed = false) => {
  if (input.idempotencyKey) {
    const recorded = await tx.payment.findUnique({ where: { idempotencyKey: input.idempotencyKey }, include: {
      method: true, receipt: true, student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } },
    } });
    if (recorded) {
      if (recorded.studentId !== input.studentId || recorded.methodId !== input.methodId || !recorded.amount.equals(input.amount) ||
        recorded.enrollmentId !== (input.enrollmentId ?? null) || recorded.reference !== (input.reference ?? null) ||
        input.currency && recorded.currency !== input.currency.toUpperCase()) throw conflict("This payment request was already recorded with different details. Refresh the ledger.");
      if (!recorded.receipt) throw conflict("Recorded payment has no receipt. Contact finance.");
      return { ...recorded, receipt: recorded.receipt };
    }
  }
  const { currency } = await ledgerContext(tx, input.studentId, input.enrollmentId, input.currency);
  const method = await validateMethod(tx, input.methodId, input.reference);
  if (method.code === "PAYPACK" && !gatewayConfirmed) throw badRequest("Paypack payments must be confirmed by the gateway");
  if (input.paidAt && input.paidAt > new Date()) throw badRequest("A received payment cannot be dated in the future");
  if (input.reference && await tx.payment.findFirst({ where: { methodId: input.methodId, reference: input.reference, txnType: "PAYMENT" } }))
    throw badRequest("This transaction reference is already recorded");
  const paidAt = input.paidAt ?? new Date();
  const payment = await tx.payment.create({ data: { ...input, currency, amount: new Prisma.Decimal(input.amount),
    txnType: "PAYMENT", receivedById: actorId }, include: { method: true, student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } });
  const receipt = await tx.receipt.create({ data: { paymentId: payment.id,
    receiptNumber: await generateReceiptNumber(tx, paidAt), issuedById: actorId } });
  await recalculateStudentFinance(tx, input.studentId);
  await writeAuditTx(tx, { actorId, action: "PAYMENT_RECORDED", entityType: "Payment", entityId: payment.id, after: payment });
  await writeActivityTx(tx, { actorId, type: "PAYMENT", title: `Payment of ${payment.amount.toString()} ${payment.currency} recorded`, studentId: input.studentId });
  return { ...payment, receipt };
};

export const updatePayment = (id: string, input: UpdatePaymentInput, actorId?: string) => transact(async tx => {
  const before = await tx.payment.findUnique({ where: { id }, include: { refunds: true, receipt: true } });
  if (!before) throw notFound("Payment not found");
  if (await tx.paymentCheckout.findUnique({ where: { paymentId: id } })) throw badRequest("Gateway payments are immutable. Use the refund workflow with a reason.");
  if (before.txnType === "REFUND") throw badRequest("Refund records are immutable. Record a correcting payment with a reason.");
  if (before.receipt?.voidedAt) throw badRequest("Voided payments are immutable. Record a new payment instead.");
  const amount = new Prisma.Decimal(input.amount ?? before.amount);
  const refunded = before.refunds.reduce((sum, row) => sum.plus(row.amount), new Prisma.Decimal(0));
  if (amount.lessThan(refunded)) throw badRequest("Payment cannot be less than its refunds");
  const reference = input.reference === undefined ? before.reference : input.reference;
  await validateMethod(tx, before.methodId, reference);
  if (reference && await tx.payment.findFirst({ where: { id: { not: id }, methodId: before.methodId, reference, txnType: "PAYMENT" } }))
    throw badRequest("This transaction reference is already recorded");
  if (input.paidAt && input.paidAt > new Date()) throw badRequest("Payment date cannot be in the future");
  const { reason, ...changes } = input;
  const payment = await tx.payment.update({ where: { id }, data: { ...changes, amount } });
  await recalculateStudentFinance(tx, before.studentId);
  await writeAuditTx(tx, { actorId, action: "PAYMENT_UPDATED", entityType: "Payment", entityId: id, before, after: payment, reason });
  return payment;
});

export const deletePayment = (id: string, input: DeletePaymentInput, actorId?: string) => transact(async tx => {
  const before = await tx.payment.findUnique({ where: { id }, include: { refunds: true } });
  if (!before) throw notFound("Payment not found");
  if (await tx.paymentCheckout.findUnique({ where: { paymentId: id } })) throw badRequest("Gateway payments are immutable. Use the refund workflow with a reason.");
  if (before.txnType === "REFUND") throw badRequest("Refund records cannot be deleted");
  // Void by refunding the remaining amount; original payment and receipt remain traceable.
  const remaining = before.amount.minus(before.refunds.reduce((sum, r) => sum.plus(r.amount), new Prisma.Decimal(0)));
  if (remaining.greaterThan(0)) await tx.payment.create({ data: {
    studentId: before.studentId, enrollmentId: before.enrollmentId, methodId: before.methodId,
    amount: remaining, currency: before.currency, txnType: "REFUND", parentPaymentId: id,
    receivedById: actorId, notes: `Voided: ${input.reason}`,
  } });
  await tx.receipt.updateMany({ where: { paymentId: id }, data: { voidedAt: new Date() } });
  await recalculateStudentFinance(tx, before.studentId);
  await writeAuditTx(tx, { actorId, action: "PAYMENT_VOIDED", entityType: "Payment", entityId: id, before, reason: input.reason });
  return { id };
});
