import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateClassInput, ListClassQuery, UpdateClassInput } from "./classes.schema.js";

const briefLevel = { select: { id: true, title: true, levelLabel: true, code: true } } as const;
const briefIntake = { select: { id: true, code: true, name: true } } as const;
const briefCampus = { select: { id: true, name: true, code: true } } as const;
const briefTeacher = {
  select: { id: true, firstName: true, lastName: true, email: true },
} as const;

const assertTeacher = async (teacherId: string): Promise<void> => {
  const teacher = await prisma.user.findUnique({
    where: { id: teacherId },
    select: { role: true, status: true },
  });
  if (!teacher || teacher.role !== "TEACHER" || teacher.status !== "ACTIVE") {
    throw badRequest("teacherId must reference an active teacher");
  }
};

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
        where: { status: "ACTIVE" },
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

export const createClass = async (input: CreateClassInput, actorId?: string) => {
  const existing = await prisma.classGroup.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("A class with this code already exists");
  }

  const [level, intake, campus] = await Promise.all([
    prisma.level.findUnique({ where: { id: input.levelId }, select: { id: true } }),
    prisma.intake.findUnique({ where: { id: input.intakeId }, select: { id: true } }),
    prisma.campus.findUnique({ where: { id: input.campusId }, select: { id: true } }),
  ]);
  if (!level) {
    throw notFound("Level not found");
  }
  if (!intake) {
    throw notFound("Intake not found");
  }
  if (!campus) {
    throw notFound("Campus not found");
  }
  if (input.teacherId) {
    await assertTeacher(input.teacherId);
  }

  const classGroup = await prisma.classGroup.create({
    data: {
      code: input.code,
      name: input.name,
      levelId: input.levelId,
      intakeId: input.intakeId,
      campusId: input.campusId,
      teacherId: input.teacherId ?? null,
      shift: input.shift,
      capacity: input.capacity ?? 30,
      room: input.room ?? null,
      isActive: input.isActive ?? true,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CLASS_CREATED",
    entityType: "ClassGroup",
    entityId: classGroup.id,
    after: classGroup,
  });

  return classGroup;
};

export const updateClass = async (id: string, input: UpdateClassInput, actorId?: string) => {
  const before = await prisma.classGroup.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Class not found");
  }

  if (input.code && input.code !== before.code) {
    const duplicate = await prisma.classGroup.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate) {
      throw conflict("A class with this code already exists");
    }
  }

  if (input.teacherId) {
    await assertTeacher(input.teacherId);
  }

  const classGroup = await prisma.classGroup.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      levelId: input.levelId,
      intakeId: input.intakeId,
      campusId: input.campusId,
      teacherId: input.teacherId,
      shift: input.shift,
      capacity: input.capacity,
      room: input.room,
      isActive: input.isActive,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CLASS_UPDATED",
    entityType: "ClassGroup",
    entityId: classGroup.id,
    before,
    after: classGroup,
  });

  return classGroup;
};

export const deleteClass = async (id: string, actorId?: string) => {
  const before = await prisma.classGroup.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Class not found");
  }

  const classGroup = await prisma.classGroup.update({ where: { id }, data: { isActive: false } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CLASS_DISABLED",
    entityType: "ClassGroup",
    entityId: classGroup.id,
    before,
    after: classGroup,
  });

  return classGroup;
};
