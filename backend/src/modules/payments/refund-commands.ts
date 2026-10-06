import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import type { CreateRefundInput } from "./payments.schema.js";

export const createRefund = (input: CreateRefundInput, actorId?: string) => transact(async tx => {
  const original = await tx.payment.findUnique({ where: { id: input.paymentId }, include: { refunds: true, receipt: true } });
  if (!original) throw notFound("Payment not found");
  if (original.txnType !== "PAYMENT" || original.receipt?.voidedAt) throw badRequest("Choose a non-voided payment to refund");
  const refunded = original.refunds.reduce((sum, r) => sum.plus(r.amount), new Prisma.Decimal(0));
  if (refunded.plus(input.amount).greaterThan(original.amount)) throw badRequest("Refund exceeds the unrefunded payment amount");
  const methodId = input.methodId ?? original.methodId;
  if (input.methodId && !await tx.paymentMethodConfig.findFirst({ where: { id: methodId, isActive: true } })) throw badRequest("Choose an active refund method");
  const refund = await tx.payment.create({ data: { studentId: original.studentId,
    enrollmentId: original.enrollmentId, methodId, amount: new Prisma.Decimal(input.amount),
    currency: original.currency, txnType: "REFUND", parentPaymentId: original.id,
    receivedById: actorId, notes: input.notes ?? input.reason } });
  await recalculateStudentFinance(tx, original.studentId);
  await writeAuditTx(tx, { actorId, action: "PAYMENT_REFUNDED", entityType: "Payment", entityId: refund.id, after: refund, reason: input.reason });
  return refund;
});
