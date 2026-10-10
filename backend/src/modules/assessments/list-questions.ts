import type { Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListQuestionQuery
} from "./assessments.schema.js";
import { teacherLevels } from "./teacher-access.js";
export const listQuestions = async (query: ListQuestionQuery, teacherId?: string) => {
  const pagination = parsePagination(query);

  const levels = await teacherLevels(teacherId);
  const where: Prisma.QuestionWhereInput = levels ? { AND: [{ levelId: { in: levels } }] } : {};
  if (query.levelId) {
    where.levelId = query.levelId;
  }
  if (query.moduleId) {
    where.moduleId = query.moduleId;
  }
  if (query.skill) {
    where.skill = query.skill;
  }
  if (query.difficulty) {
    where.difficulty = query.difficulty;
  }
  if (query.type) {
    where.type = query.type;
  }
  if (query.search) {
    where.prompt = { contains: query.search, mode: "insensitive" };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.question.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.question.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};
