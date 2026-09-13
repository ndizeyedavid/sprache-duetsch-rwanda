import { Prisma } from "../generated/prisma/client.js";
import type { PaymentStatus } from "../generated/prisma/client.js";
import type { prisma } from "./prisma.js";

// Student finance is denormalised on StudentFinance so dashboards and the profile
// read balances without aggregating full history. This is the single place that
// derives those totals; every charge, discount, payment or refund calls it.
//
// Source of truth per the spec:
//   totalDue  = sum(charges) - sum(approved discounts)
//   totalPaid = sum(payments) - sum(refunds)
//   balance   = totalDue - totalPaid

type Executor = Prisma.TransactionClient | typeof prisma;

const ZERO = new Prisma.Decimal(0);

const amountOrZero = (value: Prisma.Decimal | null | undefined): Prisma.Decimal => value ?? ZERO;

const deriveStatus = (params: {
  totalDue: Prisma.Decimal;
  netPaid: Prisma.Decimal;
  balance: Prisma.Decimal;
  refunds: Prisma.Decimal;
  hasOverdue: boolean;
}): PaymentStatus => {
  const { totalDue, netPaid, balance, refunds, hasOverdue } = params;

  if (refunds.greaterThan(ZERO) && netPaid.lessThanOrEqualTo(ZERO)) {
    return "REFUNDED";
  }
  if (totalDue.lessThanOrEqualTo(ZERO)) {
    return "WAIVED";
  }
  if (balance.lessThanOrEqualTo(ZERO)) {
    return "FULLY_PAID";
  }
  if (hasOverdue) {
    return "OVERDUE";
  }
  if (netPaid.greaterThan(ZERO)) {
    return "PARTIALLY_PAID";
  }
  return "UNPAID";
};

export const recalculateStudentFinance = async (client: Executor, studentId: string) => {
  // Sequential on the hosted DB (max 5 connections) — Promise.all would burst 6
  // concurrent queries and hit "too many connections".
  const chargeAgg = await client.charge.aggregate({ where: { studentId }, _sum: { amount: true } });
  const discountAgg = await client.discount.aggregate({
    where: { studentId, status: "APPROVED" },
    _sum: { amount: true },
  });
  const paymentAgg = await client.payment.aggregate({
    where: { studentId, txnType: "PAYMENT" },
    _sum: { amount: true },
  });
  const refundAgg = await client.payment.aggregate({
    where: { studentId, txnType: "REFUND" },
    _sum: { amount: true },
  });
  const overdueCount = await client.charge.count({ where: { studentId, dueDate: { lt: new Date() } } });
  const lastPayment = await client.payment.findFirst({
    where: { studentId, txnType: "PAYMENT" },
    orderBy: { paidAt: "desc" },
    select: { paidAt: true },
  });

  const charges = amountOrZero(chargeAgg._sum.amount);
  const discounts = amountOrZero(discountAgg._sum.amount);
  const payments = amountOrZero(paymentAgg._sum.amount);
  const refunds = amountOrZero(refundAgg._sum.amount);

  const totalDue = charges.minus(discounts);
  const netPaid = payments.minus(refunds);
  const balance = totalDue.minus(netPaid);

  const status = deriveStatus({
    totalDue,
    netPaid,
    balance,
    refunds,
    hasOverdue: overdueCount > 0 && balance.greaterThan(ZERO),
  });

  const data = {
    totalDue,
    totalDiscount: discounts,
    totalPaid: netPaid,
    balance,
    status,
    lastPaymentAt: lastPayment?.paidAt ?? null,
  };

  return client.studentFinance.upsert({
    where: { studentId },
    create: { studentId, ...data },
    update: data,
  });
};
