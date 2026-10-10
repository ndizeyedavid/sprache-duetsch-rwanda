import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { ledgerContext } from "./ledger-context.js";
import type { CreateChargeInput,DeleteChargeInput,UpdateChargeInput } from "./payments.schema.js";

async function checkDiscountCoverage(tx: Prisma.TransactionClient, studentId: string) {
  const charges = await tx.charge.aggregate({ where: { studentId }, _sum: { amount: true } });
  const discounts = await tx.discount.aggregate({ where: { studentId, status: "APPROVED" }, _sum: { amount: true } });
  if (new Prisma.Decimal(discounts._sum.amount ?? 0).greaterThan(charges._sum.amount ?? 0))
    throw badRequest("Charges cannot be reduced below approved discounts");
}
export const createCharge = (input: CreateChargeInput, actorId?: string) => transact(async tx => {
  const { currency } = await ledgerContext(tx, input.studentId, input.enrollmentId, input.currency);
  const charge = await tx.charge.create({ data: { ...input, currency, amount: new Prisma.Decimal(input.amount), createdById: actorId } });
  await recalculateStudentFinance(tx, input.studentId);
  await writeAuditTx(tx, { actorId, action: "CHARGE_CREATED", entityType: "Charge", entityId: charge.id, after: charge });
  return charge;
});
export const updateCharge = (id: string, input: UpdateChargeInput, actorId?: string) => transact(async tx => {
  const before = await tx.charge.findUnique({ where: { id } });
  if (!before) throw notFound("Charge not found");
  if (before.type === "TUITION" && input.amount !== undefined) throw badRequest("Edit tuition through the enrolment to keep its schedule consistent");
  const { reason, ...changes } = input;
  const charge = await tx.charge.update({ where: { id }, data: changes });
  await checkDiscountCoverage(tx, before.studentId);
  await recalculateStudentFinance(tx, before.studentId);
  await writeAuditTx(tx, { actorId, action: "CHARGE_UPDATED", entityType: "Charge", entityId: id, before, after: charge, reason });
  return charge;
});
export const deleteCharge = (id: string, input: DeleteChargeInput, actorId?: string) => transact(async tx => {
  const before = await tx.charge.findUnique({ where: { id } });
  if (!before) throw notFound("Charge not found");
  if (before.enrollmentId) throw badRequest("Enrolment charges are retained. Adjust the fee or approve a discount instead.");
  await tx.charge.delete({ where: { id } });
  await checkDiscountCoverage(tx, before.studentId);
  await recalculateStudentFinance(tx, before.studentId);
  await writeAuditTx(tx, { actorId, action: "CHARGE_DELETED", entityType: "Charge", entityId: id, before, reason: input.reason });
  return { id };
});
