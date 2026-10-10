import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import { studentListWhere } from './student-list-where.js';
import type { ListStudentsQuery } from "./students.schema.js";
export const listStudents = async (query: ListStudentsQuery) => {
  const pagination = parsePagination(query);
  const where = studentListWhere(query);

  const [rows, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: safeUserSelect },
        campus: { select: { id: true, code: true, name: true } },
        intake: { select: { id: true, code: true, name: true } },
        currentLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
        finance: true,
      },
    }),
    prisma.student.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
