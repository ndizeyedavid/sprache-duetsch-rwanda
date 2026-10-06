import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { briefTeacher } from './brief-teacher.js';
import { classGroupDetailSelect } from './class-group-detail-select.js';
import type {
ListSessionsQuery
} from "./sessions.schema.js";
export const listSessions = async (query: ListSessionsQuery, forcedTeacherId?: string) => {
  const pagination = parsePagination(query);

  const where: Prisma.ClassSessionWhereInput = {};
  if (query.classGroupId) where.classGroupId = query.classGroupId;
  if (query.status) where.status = query.status;
  if (query.teacherId) where.teacherId = query.teacherId;
  if (forcedTeacherId) where.AND = [{ classGroup: { teacherId: forcedTeacherId } }];
  if (query.from || query.to) where.startAt = { gte: query.from, lte: query.to };
  if (query.levelId || query.campusId || query.intakeId) {
    where.classGroup = {
      ...(query.levelId ? { levelId: query.levelId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
      ...(query.intakeId ? { intakeId: query.intakeId } : {}),
    };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.classSession.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        classGroup: { select: classGroupDetailSelect },
        teacher: briefTeacher,
        _count: { select: { attendance: true } },
      },
    }),
    prisma.classSession.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
