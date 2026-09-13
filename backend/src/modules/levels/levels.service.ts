import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { conflict, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateLevelInput, ListLevelQuery, UpdateLevelInput } from "./levels.schema.js";

export const listLevels = async (query: ListLevelQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.LevelWhereInput = {};
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }
  if (query.language) {
    where.language = { equals: query.language, mode: "insensitive" };
  }
  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
      { levelLabel: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.level.findMany({
      where,
      orderBy: { order: "asc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.level.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getLevel = async (id: string) => {
  const level = await prisma.level.findUnique({
    where: { id },
    include: { _count: { select: { modules: true, enrollments: true, classes: true } } },
  });

  if (!level) {
    throw notFound("Level not found");
  }

  return level;
};

export const createLevel = async (input: CreateLevelInput, actorId?: string) => {
  const existing = await prisma.level.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("A level with this code already exists");
  }

  const level = await prisma.level.create({
    data: {
      code: input.code,
      language: input.language,
      title: input.title,
      levelLabel: input.levelLabel,
      summary: input.summary ?? null,
      objectives: input.objectives ?? [],
      order: input.order ?? 0,
      defaultFee: new Prisma.Decimal(input.defaultFee ?? 0),
      currency: input.currency,
      isActive: input.isActive ?? true,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "LEVEL_CREATED",
    entityType: "Level",
    entityId: level.id,
    after: level,
  });

  return level;
};

export const updateLevel = async (id: string, input: UpdateLevelInput, actorId?: string) => {
  const before = await prisma.level.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Level not found");
  }

  if (input.code && input.code !== before.code) {
    const duplicate = await prisma.level.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate) {
      throw conflict("A level with this code already exists");
    }
  }

  const data: Prisma.LevelUpdateInput = {
    code: input.code,
    language: input.language,
    title: input.title,
    levelLabel: input.levelLabel,
    summary: input.summary,
    objectives: input.objectives,
    order: input.order,
    currency: input.currency,
    isActive: input.isActive,
  };
  if (input.defaultFee !== undefined) {
    data.defaultFee = new Prisma.Decimal(input.defaultFee);
  }

  const level = await prisma.level.update({ where: { id }, data });

  await writeAudit({
    actorId: actorId ?? null,
    action: "LEVEL_UPDATED",
    entityType: "Level",
    entityId: level.id,
    before,
    after: level,
  });

  return level;
};

export const deleteLevel = async (id: string, actorId?: string) => {
  const before = await prisma.level.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Level not found");
  }

  const level = await prisma.level.update({ where: { id }, data: { isActive: false } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "LEVEL_DISABLED",
    entityType: "Level",
    entityId: level.id,
    before,
    after: level,
  });

  return level;
};
