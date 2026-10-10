import { prisma } from "../../lib/prisma.js";
import { paymentInclude } from './payment-include.js';
import { paymentListWhere } from './payment-list-where.js';
import type {
ListPaymentsQuery
} from "./payments.schema.js";
export const exportPayments = async (query: ListPaymentsQuery) => {
  const rows = await prisma.payment.findMany({
    where: paymentListWhere(query),
    orderBy: { paidAt: "desc" },
    take: 5000,
    include: paymentInclude,
  });

  return rows.map((row) => ({
    paidAt: row.paidAt.toISOString(),
    studentCode: row.student.studentCode,
    studentName: `${row.student.user.firstName} ${row.student.user.lastName}`.trim(),
    amount: row.amount.toString(),
    currency: row.currency,
    txnType: row.txnType,
    method: row.method.name,
    reference: row.reference ?? "",
    receiptNumber: row.receipt?.receiptNumber ?? "",
    notes: row.notes ?? "",
  }));
};
