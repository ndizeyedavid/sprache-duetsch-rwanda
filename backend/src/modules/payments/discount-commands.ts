import { Prisma } from "../../generated/prisma/client.js";
import { writeAuditTx } from "../../lib/audit.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { transact } from "../../lib/transactions.js";
import { ledgerContext } from "./ledger-context.js";
import type { CreateDiscountInput,RejectDiscountInput } from "./payments.schema.js";

export const createDiscount = (input: CreateDiscountInput, actorId?: string) => transact(async tx => {
  await ledgerContext(tx, input.studentId, input.enrollmentId);
  if (input.type === "PERCENTAGE" && input.value > 100) throw badRequest("Percentage must not exceed 100");
  const base = await tx.charge.aggregate({ where: { studentId: input.studentId, ...(input.enrollmentId ? { enrollmentId: input.enrollmentId } : {}) }, _sum: { amount: true } });
  const value = new Prisma.Decimal(input.value);
  const amount = input.type === "PERCENTAGE" ? new Prisma.Decimal(base._sum.amount ?? 0).times(value).dividedBy(100).toDecimalPlaces(2) : value;
  if (amount.greaterThan(base._sum.amount ?? 0)) throw badRequest("Discount exceeds eligible charges");
  const discount = await tx.discount.create({ data: { ...input, value, amount, requestedById: actorId } });
  await writeAuditTx(tx, { actorId, action: "DISCOUNT_REQUESTED", entityType: "Discount", entityId: discount.id, after: discount });
  return discount;
});

export const approveDiscount = (id: string, actorId?: string) => transact(async tx => {
  const before = await tx.discount.findUnique({ where: { id } });
  if (!before) throw notFound("Discount not found");
  if (before.status !== "PENDING") throw badRequest("Only pending discounts can be approved");
  const scope = { studentId: before.studentId, ...(before.enrollmentId ? { enrollmentId: before.enrollmentId } : {}) };
  const charges = await tx.charge.aggregate({ where: scope, _sum: { amount: true } });
  const applied = await tx.discount.aggregate({ where: { ...scope, status: "APPROVED" }, _sum: { amount: true } });
  const allCharges = await tx.charge.aggregate({ where: { studentId: before.studentId }, _sum: { amount: true } });
  const allDiscounts = await tx.discount.aggregate({ where: { studentId: before.studentId, status: "APPROVED" }, _sum: { amount: true } });
  if (before.amount.plus(applied._sum.amount ?? 0).greaterThan(charges._sum.amount ?? 0) ||
    before.amount.plus(allDiscounts._sum.amount ?? 0).greaterThan(allCharges._sum.amount ?? 0)) throw badRequest("Approved discounts would exceed charges");
  const discount = await tx.discount.update({ where: { id }, data: { status: "APPROVED", approvedById: actorId, approvedAt: new Date() } });
  await recalculateStudentFinance(tx, before.studentId);
  await writeAuditTx(tx, { actorId, action: "DISCOUNT_APPROVED", entityType: "Discount", entityId: id, before, after: discount });
  return discount;
});
export const rejectDiscount = (id: string, input: RejectDiscountInput, actorId?: string) => transact(async tx => {
  const before = await tx.discount.findUnique({ where: { id } });
  if (!before) throw notFound("Discount not found");
  if (before.status !== "PENDING") throw badRequest("Only pending discounts can be rejected");
  const discount = await tx.discount.update({ where: { id }, data: { status: "REJECTED" } });
  await writeAuditTx(tx, { actorId, action: "DISCOUNT_REJECTED", entityType: "Discount", entityId: id, before, after: discount, reason: input.reason });
  return discount;
});
