import type { Prisma } from "../../generated/prisma/client.js";
import { refreshFinanceProfiles } from "../../lib/finance.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
OutstandingQuery
} from "./payments.schema.js";
import { studentSummarySelect } from './student-summary-select.js';
export const listOutstanding = async (query: OutstandingQuery) => {
  await refreshFinanceProfiles();
  const pagination = parsePagination(query);

  const studentWhere: Prisma.StudentWhereInput = {};
  if (query.campusId) studentWhere.campusId = query.campusId;
  if (query.levelId) studentWhere.currentLevelId = query.levelId;
  if (query.intakeId) studentWhere.intakeId = query.intakeId;

  const where: Prisma.StudentFinanceWhereInput = {
    balance: { gt: 0 },
    student: studentWhere,
  };

  const [rows, total] = await prisma.$transaction([
    prisma.studentFinance.findMany({
      where,
      orderBy: { balance: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { student: { select: studentSummarySelect } },
    }),
    prisma.studentFinance.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
