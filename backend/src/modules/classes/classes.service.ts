import type { Prisma } from "../../generated/prisma/client.js";
import { notFound } from "../../lib/http-error.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { ListClassQuery } from "./classes.schema.js";

const briefLevel = { select: { id: true, title: true, levelLabel: true, code: true } } as const;
const briefIntake = { select: { id: true, code: true, name: true } } as const;
const briefCampus = { select: { id: true, name: true, code: true } } as const;
const briefTeacher = {
  select: { id: true, firstName: true, lastName: true, email: true },
} as const;

export const listClasses = async (query: ListClassQuery, forcedTeacherId?: string) => {
  const pagination = parsePagination(query);

  const where: Prisma.ClassGroupWhereInput = {};
  if (query.levelId) {
    where.levelId = query.levelId;
  }
  if (query.intakeId) {
    where.intakeId = query.intakeId;
  }
  if (query.campusId) {
    where.campusId = query.campusId;
  }
  if (query.shift) {
    where.shift = query.shift;
  }
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }
  if (query.search) {
    where.OR = [
      { code: { contains: query.search, mode: "insensitive" } },
      { name: { contains: query.search, mode: "insensitive" } },
    ];
  }

  // Teachers only ever see the classes they are assigned to.
  if (forcedTeacherId) {
    where.teacherId = forcedTeacherId;
  } else if (query.teacherId) {
    where.teacherId = query.teacherId;
  }

  const [rows, total] = await prisma.$transaction([
    prisma.classGroup.findMany({
      where,
      orderBy: { code: "asc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        level: briefLevel,
        intake: briefIntake,
        campus: briefCampus,
        teacher: briefTeacher,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.classGroup.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getClass = async (id: string) => {
  const classGroup = await prisma.classGroup.findUnique({
    where: { id },
    include: {
      level: briefLevel,
      intake: briefIntake,
      campus: briefCampus,
      teacher: briefTeacher,
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        select: {
          student: {
            select: {
              id: true,
              studentCode: true,
              status: true,
              user: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
              },
            },
          },
        },
      },
      _count: { select: { sessions: true } },
    },
  });

  if (!classGroup) {
    throw notFound("Class not found");
  }

  return classGroup;
};


export { createClass,deleteClass,updateClass } from "./class-commands.js";
