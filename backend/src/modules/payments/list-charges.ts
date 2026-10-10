import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { dateFilter } from './date-filter.js';
import type {
ListChargesQuery
} from "./payments.schema.js";
import { studentSummarySelect } from './student-summary-select.js';
export const listCharges = async (query: ListChargesQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.ChargeWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.enrollmentId) where.enrollmentId = query.enrollmentId;
  if (query.type) where.type = query.type;
  where.createdAt = dateFilter(query.from, query.to);

  const [rows, total] = await prisma.$transaction([
    prisma.charge.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        student: { select: studentSummarySelect },
        enrollment: { select: { id: true, levelId: true, currency: true } },
      },
    }),
    prisma.charge.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
