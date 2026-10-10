import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListDiscountsQuery
} from "./payments.schema.js";
import { studentSummarySelect } from './student-summary-select.js';
export const listDiscounts = async (query: ListDiscountsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.DiscountWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.status) where.status = query.status;

  const [rows, total] = await prisma.$transaction([
    prisma.discount.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        student: { select: studentSummarySelect },
        enrollment: { select: { id: true, levelId: true, currency: true } },
      },
    }),
    prisma.discount.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
