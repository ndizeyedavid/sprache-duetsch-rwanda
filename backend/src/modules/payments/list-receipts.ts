import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { dateFilter } from './date-filter.js';
import type {
ListReceiptsQuery
} from "./payments.schema.js";
import { receiptInclude } from './receipt-include.js';
export const listReceipts = async (query: ListReceiptsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.ReceiptWhereInput = {};
  if (query.studentId) where.payment = { studentId: query.studentId };
  where.issuedAt = dateFilter(query.from, query.to);

  const [rows, total] = await prisma.$transaction([
    prisma.receipt.findMany({
      where,
      orderBy: { issuedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: receiptInclude,
    }),
    prisma.receipt.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
