import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { transact } from "../../lib/transactions.js";
import { createPaymentTx } from "../payments/payment-commands.js";
import { resolveStudentId } from "../payments/resolve-student-id.js";
import { claimProblem } from "./claim-rules.js";
import { notifyFinanceOfClaim,notifyStudentOfReview } from "./claim-notify.js";
import type { ApproveClaimInput,SubmitClaimInput } from "./payment-claims.schema.js";

const duplicateReference = async (tx: Prisma.TransactionClient, methodId: string, reference?: string | null, ignoreClaim?: string) =>
  Boolean(reference && (await tx.payment.findFirst({ where: { methodId, reference, txnType: "PAYMENT" } })
    || await tx.paymentClaim.findFirst({ where: { methodId, reference, status: { not: "REJECTED" }, id: ignoreClaim ? { not: ignoreClaim } : undefined } })));

/** Student reports a payment made outside the gateway; finance is notified to check it. */
export async function submitClaim(userId: string, input: SubmitClaimInput) {
  const studentId = await resolveStudentId(userId);
  const claim = await transact(async (tx) => {
    const [method, pending, finance] = await Promise.all([
      tx.paymentMethodConfig.findUnique({ where: { id: input.methodId } }),
      tx.paymentClaim.count({ where: { studentId, status: "PENDING" } }),
      tx.studentFinance.findUnique({ where: { studentId } }),
    ]);
    const problem = claimProblem(input, method, pending);
    if (problem) throw badRequest(problem);
    if (await duplicateReference(tx, input.methodId, input.reference)) throw conflict("This transaction reference has already been reported or recorded");
    const created = await tx.paymentClaim.create({ data: { ...input, studentId, amount: new Prisma.Decimal(input.amount), currency: finance?.currency ?? "RWF" },
      include: { method: true, student: { include: { user: { select: { firstName: true, lastName: true } } } } } });
    await writeAuditTx(tx, { actorId: userId, action: "PAYMENT_CLAIM_SUBMITTED", entityType: "PaymentClaim", entityId: created.id, after: created });
    return created;
  });
  await notifyFinanceOfClaim(claim);
  return claim;
}

const pendingClaim = async (tx: Prisma.TransactionClient, id: string) => {
  const claim = await tx.paymentClaim.findUnique({ where: { id }, include: { student: { select: { userId: true } }, method: true } });
  if (!claim) throw notFound("Payment report not found");
  if (claim.status !== "PENDING") throw conflict(`This payment report was already ${claim.status.toLowerCase()}`);
  return claim;
};

/** Finance confirms the money arrived: becomes a real payment with receipt, audit and balance update. */
export async function approveClaim(id: string, input: ApproveClaimInput, actorId: string) {
  const result = await transact(async (tx) => {
    const claim = await pendingClaim(tx, id);
    if (await duplicateReference(tx, claim.methodId, claim.reference, claim.id)) throw conflict("A payment with this reference is already recorded");
    const amount = input.amount ?? claim.amount.toNumber();
    const payment = await createPaymentTx(tx, {
      idempotencyKey: claim.id, studentId: claim.studentId, methodId: claim.methodId, amount, currency: claim.currency,
      reference: claim.reference ?? undefined, paidAt: claim.paidAt,
      notes: `Reported by student${claim.note ? `: ${claim.note}` : ""}${input.note ? ` · Finance: ${input.note}` : ""}`.slice(0, 500),
    }, actorId);
    const updated = await tx.paymentClaim.update({ where: { id }, data: {
      status: "APPROVED", paymentId: payment.id, reviewedById: actorId, reviewedAt: new Date(), reviewNote: input.note ?? null } });
    await writeAuditTx(tx, { actorId, action: "PAYMENT_CLAIM_APPROVED", entityType: "PaymentClaim", entityId: id, before: claim, after: updated, reason: input.note });
    return { claim: updated, payment, userId: claim.student.userId };
  });
  await notifyStudentOfReview(result.userId, "APPROVED", result.claim, result.payment.receipt?.receiptNumber);
  return result;
}

/** Finance could not find the money; the student sees the reason and can report again. */
export async function rejectClaim(id: string, reason: string, actorId: string) {
  const result = await transact(async (tx) => {
    const claim = await pendingClaim(tx, id);
    const updated = await tx.paymentClaim.update({ where: { id }, data: { status: "REJECTED", reviewedById: actorId, reviewedAt: new Date(), reviewNote: reason } });
    await writeAuditTx(tx, { actorId, action: "PAYMENT_CLAIM_REJECTED", entityType: "PaymentClaim", entityId: id, before: claim, after: updated, reason });
    return { claim: updated, userId: claim.student.userId };
  });
  await notifyStudentOfReview(result.userId, "REJECTED", result.claim);
  return result.claim;
}

/** A student withdraws their own report before finance reviews it (e.g. typo in the reference). */
export async function withdrawClaim(id: string, userId: string) {
  const studentId = await resolveStudentId(userId);
  return transact(async (tx) => {
    const claim = await pendingClaim(tx, id);
    if (claim.studentId !== studentId) throw notFound("Payment report not found");
    await writeAuditTx(tx, { actorId: userId, action: "PAYMENT_CLAIM_WITHDRAWN", entityType: "PaymentClaim", entityId: id, before: claim });
    return tx.paymentClaim.update({ where: { id }, data: { status: "REJECTED", reviewedAt: new Date(), reviewNote: "Withdrawn by the student" } });
  });
}

export const pendingClaimCount = () => prisma.paymentClaim.count({ where: { status: "PENDING" } });
