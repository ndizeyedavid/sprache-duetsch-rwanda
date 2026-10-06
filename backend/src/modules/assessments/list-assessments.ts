import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListAssessmentQuery
} from "./assessments.schema.js";
import { teacherLevels } from "./teacher-access.js";
export const listAssessments = async (query: ListAssessmentQuery, teacherId?: string) => {
  const pagination = parsePagination(query);

  const levels = await teacherLevels(teacherId);
  const where: Prisma.AssessmentWhereInput = levels ? { AND: [{ levelId: { in: levels } }] } : {};
  if (query.levelId) {
    where.levelId = query.levelId;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.isPublished !== undefined) {
    where.isPublished = query.isPublished;
  }

  const [rows, total] = await prisma.$transaction([
    prisma.assessment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { _count: { select: { attempts: true, questions: true } } },
    }),
    prisma.assessment.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
