import type { Prisma } from "../../generated/prisma/client.js";
import { dateFilter } from './date-filter.js';
import type {
ListPaymentsQuery
} from "./payments.schema.js";
export const paymentListWhere = (query: ListPaymentsQuery): Prisma.PaymentWhereInput => {
  const where: Prisma.PaymentWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.enrollmentId) where.enrollmentId = query.enrollmentId;
  if (query.methodId) where.methodId = query.methodId;
  if (query.txnType) where.txnType = query.txnType;
  where.paidAt = dateFilter(query.from, query.to);
  return where;
};
