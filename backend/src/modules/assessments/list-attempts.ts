import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListAttemptQuery
} from "./assessments.schema.js";
import { attemptListWhere } from "./attempt-list-where.js";
export const listAttempts = async (query: ListAttemptQuery, teacherId?: string) => {
  const pagination = parsePagination(query);

  const where = await attemptListWhere(query, teacherId);

  const [rows, total] = await prisma.$transaction([
    prisma.attempt.findMany({
      where,
      orderBy: { startedAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: {
        id: true,
        status: true,
        attemptNumber: true,
        score: true,
        maxScore: true,
        passed: true,
        submittedAt: true,
        student: {
          select: { studentCode: true, user: { select: { firstName: true, lastName: true } } },
        },
        assessment: { select: { id: true, title: true } },
      },
    }),
    prisma.attempt.count({ where }),
  ]);

  // Post-migration these columns will be returned; for now we enrich with safe defaults
  const enriched = (rows as unknown as { cheatFlagged?: boolean; cheatCount?: number }[]).map((r) => ({
    ...r,
    cheatFlagged: r.cheatFlagged ?? false,
    cheatCount: r.cheatCount ?? 0,
  }));

  return buildPaginated(enriched as unknown as typeof rows, total, pagination);
};
