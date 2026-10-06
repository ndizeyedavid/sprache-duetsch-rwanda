import type { PaymentStatus } from "../generated/prisma/client.js";
import { Prisma } from "../generated/prisma/client.js";
import { allocateObligations,assertCurrency } from "./finance-policy.js";
import { prisma } from "./prisma.js";
import { transact } from "./transactions.js";

const ZERO = new Prisma.Decimal(0);
type Executor = Prisma.TransactionClient | typeof prisma;

export async function recalculateStudentFinance(client: Executor, studentId: string) {
  if (client === prisma) return transact(tx => calculate(tx, studentId));
  return calculate(client, studentId);
}

async function calculate(client: Prisma.TransactionClient, studentId: string) {
  await client.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${studentId}))`;
  const charges = await client.charge.findMany({ where: { studentId } });
  const payments = await client.payment.findMany({ where: { studentId } });
  const discounts = await client.discount.findMany({ where: { studentId, status: "APPROVED" } });
  const currency = assertCurrency([...charges, ...payments].map(row => row.currency));
  const sum = (rows: { amount: Prisma.Decimal }[]) => rows.reduce((total, row) => total.plus(row.amount), ZERO);
  const totalDiscount = sum(discounts);
  const totalDue = sum(charges).minus(totalDiscount);
  const refunds = sum(payments.filter(row => row.txnType === "REFUND"));
  const totalPaid = sum(payments.filter(row => row.txnType === "PAYMENT")).minus(refunds);
  const balance = totalDue.minus(totalPaid);
  const schedule = allocateObligations(charges, totalPaid.plus(totalDiscount));
  let status: PaymentStatus = "UNPAID";
  if (totalDue.lessThanOrEqualTo(ZERO)) status = "WAIVED";
  else if (balance.lessThanOrEqualTo(ZERO)) status = "FULLY_PAID";
  else if (schedule.overdueAmount.greaterThan(ZERO)) status = "OVERDUE";
  else if (refunds.greaterThan(ZERO) && totalPaid.lessThanOrEqualTo(ZERO)) status = "REFUNDED";
  else if (totalPaid.greaterThan(ZERO)) status = "PARTIALLY_PAID";
  const lastPaymentAt = payments.filter(row => row.txnType === "PAYMENT")
    .sort((a, b) => b.paidAt.getTime() - a.paidAt.getTime())[0]?.paidAt ?? null;
  const data = { totalDue, totalDiscount, totalPaid, balance, currency, status, lastPaymentAt,
    overdueAmount: schedule.overdueAmount, nextDueAt: schedule.nextDueAt, nextDueAmount: schedule.nextDueAmount };
  const existing = await client.studentFinance.findUnique({ where: { studentId } });
  if (existing && existing.currency === currency && existing.status === status &&
    existing.totalDue.equals(totalDue) && existing.totalPaid.equals(totalPaid) && existing.totalDiscount.equals(totalDiscount) &&
    existing.balance.equals(balance) && existing.overdueAmount.equals(schedule.overdueAmount) && existing.nextDueAmount.equals(schedule.nextDueAmount) &&
    existing.lastPaymentAt?.getTime() === lastPaymentAt?.getTime() && existing.nextDueAt?.getTime() === schedule.nextDueAt?.getTime()) return existing;
  return client.studentFinance.upsert({ where: { studentId }, create: { studentId, ...data }, update: data });
}

export async function refreshFinanceProfiles() {
  const students = await prisma.student.findMany({ select: { id: true } });
  for (const student of students) await recalculateStudentFinance(prisma, student.id);
}

export async function assertStudentCurrency(tx: Prisma.TransactionClient, studentId: string, currency: string) {
  const charges = await tx.charge.findMany({ where: { studentId }, select: { currency: true } });
  const payments = await tx.payment.findMany({ where: { studentId }, select: { currency: true } });
  return assertCurrency([...charges, ...payments].map(row => row.currency), currency);
}
