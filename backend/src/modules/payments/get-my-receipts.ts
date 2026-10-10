import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
MyReceiptsQuery
} from "./payments.schema.js";
import { receiptInclude } from './receipt-include.js';
import { resolveStudentId } from './resolve-student-id.js';
export const getMyReceipts = async (userId: string, query: MyReceiptsQuery) => {
  const studentId = await resolveStudentId(userId);
  const pagination = parsePagination(query);

  const where: Prisma.ReceiptWhereInput = { payment: { studentId } };

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
