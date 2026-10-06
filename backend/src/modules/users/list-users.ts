import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import type {
ListUserQuery
} from "./users.schema.js";
export const listUsers = async (query: ListUserQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.UserWhereInput = {};
  if (query.role) {
    where.role = query.role;
  }
  if (query.status) {
    where.status = query.status;
  }
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: safeUserSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
