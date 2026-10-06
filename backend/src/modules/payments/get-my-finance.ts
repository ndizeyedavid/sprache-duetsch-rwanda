import { Prisma } from "../../generated/prisma/client.js";
import { allocateObligations } from "../../lib/finance-policy.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { prisma } from "../../lib/prisma.js";
import { methodSummarySelect } from './method-summary-select.js';
import { resolveStudentId } from './resolve-student-id.js';
export const getMyFinance = async (userId: string) => {
  const studentId = await resolveStudentId(userId);

  await recalculateStudentFinance(prisma, studentId);
  const [finance, charges, payments, discounts] = await Promise.all([
    prisma.studentFinance.findUnique({ where: { studentId } }),
    prisma.charge.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({
      where: { studentId },
      orderBy: { paidAt: "desc" },
      include: { method: { select: methodSummarySelect }, receipt: true },
    }),
    prisma.discount.findMany({ where: { studentId }, orderBy: { createdAt: "desc" } }),
  ]);

  const paid = payments.reduce((sum, row) => sum.plus(row.txnType === "REFUND" ? row.amount.negated() : row.amount), new Prisma.Decimal(0));
  const credit = discounts.filter(row => row.status === "APPROVED").reduce((sum, row) => sum.plus(row.amount), paid);
  const allocation = allocateObligations(charges, credit);
  const schedule = new Map(allocation.obligations.map(row => [row.id, row]));
  return { finance, charges: charges.map(row => {
    const obligation = schedule.get(row.id)!;
    return { ...row, outstanding: obligation.outstanding, dueAt: obligation.dueAt,
      obligationStatus: obligation.outstanding.isZero() ? "PAID" : obligation.overdue ? "OVERDUE" : obligation.outstanding.lessThan(row.amount) ? "PARTIALLY_PAID" : "UPCOMING" };
  }), payments, discounts };
};
