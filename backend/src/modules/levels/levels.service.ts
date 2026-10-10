import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest,conflict,notFound } from "../../lib/http-error.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateLevelInput,ListLevelQuery,UpdateLevelInput } from "./levels.schema.js";

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
    include: {
      _count: { select: { modules: true, enrollments: true, classes: true, certificates: true } },
    },
  });

  if (!level) {
    throw notFound("Level not found");
  }

  return level;
};

const validateCoursebook = async (url?: string | null) => {
  if (!url) return;
  const name = url.split('/').pop();
  const file = name ? await prisma.uploadedFile.findUnique({ where: { name } }) : null;
  if (!file || file.mimeType !== "application/pdf") throw badRequest("Coursebook must be an uploaded PDF");
};

export const createLevel = async (input: CreateLevelInput, actorId?: string) => {
  await validateCoursebook(input.coursebookUrl);
  if (input.currency.toUpperCase() === "RWF" && !Number.isInteger(input.defaultFee ?? 0)) throw badRequest("Course prices in RWF must be whole amounts");
  const existing = await prisma.level.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("A level with this code already exists");
  }

  const level = await prisma.level.create({
    data: {
      coursebookUrl: input.coursebookUrl, coursebookPages: input.coursebookPages, completionRules: input.completionRules,
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
  await validateCoursebook(input.coursebookUrl);
  const before = await prisma.level.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Level not found");
  }

  if ((input.currency ?? before.currency).toUpperCase() === "RWF" && !Number.isInteger(input.defaultFee ?? Number(before.defaultFee))) throw badRequest("Course prices in RWF must be whole amounts");

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
    coursebookUrl: input.coursebookUrl, coursebookPages: input.coursebookPages, completionRules: input.completionRules,
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

const countLabel = (count: number, one: string, many: string) =>
  `${count} ${count === 1 ? one : many}`;

export const deleteLevel = async (id: string, actorId?: string) => {
  const found = await prisma.level.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true, classes: true, certificates: true } } },
  });
  if (!found) {
    throw notFound("Level not found");
  }

  // Enrollments, classes and certificates carry student and payment history, so they
  // must be moved or removed first. Curriculum content is deleted with the level.
  const { _count: usage, ...before } = found;
  const blockers = [
    usage.enrollments ? countLabel(usage.enrollments, "enrolment", "enrolments") : null,
    usage.classes ? countLabel(usage.classes, "class", "classes") : null,
    usage.certificates ? countLabel(usage.certificates, "certificate", "certificates") : null,
  ].filter((label): label is string => label !== null);
  if (blockers.length > 0) {
    const last = blockers.pop();
    const list = blockers.length > 0 ? `${blockers.join(", ")} and ${last}` : last;
    throw conflict(
      `${before.code} still has ${list}. Move or remove them before deleting this level.`,
      usage,
    );
  }

  // Modules cascade to lessons, materials, activities, submissions and progress.
  await prisma.$transaction([
    prisma.assessment.deleteMany({ where: { levelId: id } }),
    prisma.question.deleteMany({ where: { levelId: id } }),
    prisma.module.deleteMany({ where: { levelId: id } }),
    prisma.level.delete({ where: { id } }),
  ]);

  await writeAudit({
    actorId: actorId ?? null,
    action: "LEVEL_DELETED",
    entityType: "Level",
    entityId: before.id,
    before,
  });

  return { id: before.id, code: before.code };
};
