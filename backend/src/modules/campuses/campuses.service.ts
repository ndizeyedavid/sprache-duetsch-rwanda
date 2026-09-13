import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { conflict, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateCampusInput, ListCampusQuery, UpdateCampusInput } from "./campuses.schema.js";

export const listCampuses = async (query: ListCampusQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.CampusWhereInput = {};
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { code: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.campus.findMany({
      where,
      orderBy: { name: "asc" },
      skip: pagination.skip,
      take: pagination.take,
      include: { _count: { select: { students: true, classes: true } } },
    }),
    prisma.campus.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getCampus = async (id: string) => {
  const campus = await prisma.campus.findUnique({
    where: { id },
    include: { _count: { select: { students: true, classes: true, enrollments: true } } },
  });

  if (!campus) {
    throw notFound("Campus not found");
  }

  return campus;
};

export const createCampus = async (input: CreateCampusInput, actorId?: string) => {
  const existing = await prisma.campus.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("A campus with this code already exists");
  }

  const campus = await prisma.campus.create({
    data: {
      code: input.code,
      name: input.name,
      address: input.address ?? null,
      phone: input.phone ?? null,
      email: input.email ?? null,
      isActive: input.isActive ?? true,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CAMPUS_CREATED",
    entityType: "Campus",
    entityId: campus.id,
    after: campus,
  });

  return campus;
};

export const updateCampus = async (id: string, input: UpdateCampusInput, actorId?: string) => {
  const before = await prisma.campus.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Campus not found");
  }

  if (input.code && input.code !== before.code) {
    const duplicate = await prisma.campus.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate) {
      throw conflict("A campus with this code already exists");
    }
  }

  const campus = await prisma.campus.update({
    where: { id },
    data: {
      code: input.code,
      name: input.name,
      address: input.address,
      phone: input.phone,
      email: input.email,
      isActive: input.isActive,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "CAMPUS_UPDATED",
    entityType: "Campus",
    entityId: campus.id,
    before,
    after: campus,
  });

  return campus;
};
