import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { loadScheduleAccess,protectStudentSession } from "./session-access.js";
import type {
StudentSessionsQuery
} from "./sessions.schema.js";
import { studentSessionSelect } from './student-session-select.js';
export const getMySessions = async (userId: string, query: StudentSessionsQuery) => {
  const profile = await loadScheduleAccess(userId);
  const pagination = parsePagination(query);
  if (profile.classGroupIds.length === 0) {
    return buildPaginated([], 0, pagination);
  }

  const where: Prisma.ClassSessionWhereInput = {
    classGroupId: { in: profile.classGroupIds },
    ...(query.scope === "all" ? {} : { startAt: { lt: new Date() } }),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.classSession.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: studentSessionSelect,
    }),
    prisma.classSession.count({ where }),
  ]);

  return buildPaginated(rows.map(row => protectStudentSession(row, profile)), total, pagination);
};
