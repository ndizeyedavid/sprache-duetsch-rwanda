import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { paymentInclude } from './payment-include.js';
import { paymentListWhere } from './payment-list-where.js';
import type {
ListPaymentsQuery
} from "./payments.schema.js";
export const listPayments = async (query: ListPaymentsQuery) => {
  const pagination = parsePagination(query);
  const where = paymentListWhere(query);

  const [rows, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      orderBy: { paidAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: paymentInclude,
    }),
    prisma.payment.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
