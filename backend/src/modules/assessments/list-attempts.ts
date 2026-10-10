import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListAttemptQuery
} from "./assessments.schema.js";
import { teacherLevels } from "./teacher-access.js";
export const listAttempts = async (query: ListAttemptQuery, teacherId?: string) => {
  const pagination = parsePagination(query);

  const levels = await teacherLevels(teacherId);
  const where: Prisma.AttemptWhereInput = teacherId ? { AND: [{ assessment: { levelId: { in: levels ?? [] } } }, { student: { enrollments: { some: { classGroup: { teacherId }, status: "ACTIVE" } } } }] } : {};
  if (query.assessmentId) {
    where.assessmentId = query.assessmentId;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  } else if (query.classGroupId) {
    const studentIds = await prisma.enrollment
      .findMany({
        where: { classGroupId: query.classGroupId },
        select: { studentId: true },
        distinct: ["studentId"],
      })
      .then((rows) => rows.map((row) => row.studentId));
    where.studentId = studentIds.length > 0 ? { in: studentIds } : { in: [] };
  }
  if (query.status) {
    where.status = query.status;
  }

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
