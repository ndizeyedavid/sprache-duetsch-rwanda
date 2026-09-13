import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { conflict, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { CreateIntakeInput, ListIntakeQuery, UpdateIntakeInput } from "./intakes.schema.js";

export const listIntakes = async (query: ListIntakeQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.IntakeWhereInput = {};
  if (query.isActive !== undefined) {
    where.isActive = query.isActive;
  }
  if (query.upcoming) {
    where.endDate = { gte: new Date() };
  }
  if (query.search) {
    where.OR = [
      { code: { contains: query.search, mode: "insensitive" } },
      { name: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.intake.findMany({
      where,
      orderBy: { startDate: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.intake.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getIntake = async (id: string) => {
  const intake = await prisma.intake.findUnique({
    where: { id },
    include: { _count: { select: { enrollments: true, classes: true } } },
  });

  if (!intake) {
    throw notFound("Intake not found");
  }

  return intake;
};

export const createIntake = async (input: CreateIntakeInput, actorId?: string) => {
  const existing = await prisma.intake.findUnique({
    where: { code: input.code },
    select: { id: true },
  });
  if (existing) {
    throw conflict("An intake with this code already exists");
  }

  const intake = await prisma.intake.create({
    data: {
      code: input.code,
      name: input.name,
      startDate: input.startDate,
      endDate: input.endDate,
      enrollmentOpensAt: input.enrollmentOpensAt ?? null,
      enrollmentEndsAt: input.enrollmentEndsAt ?? null,
      registrationFee: new Prisma.Decimal(input.registrationFee ?? 0),
      bookFee: new Prisma.Decimal(input.bookFee ?? 0),
      currency: input.currency,
      isActive: input.isActive ?? true,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "INTAKE_CREATED",
    entityType: "Intake",
    entityId: intake.id,
    after: intake,
  });

  return intake;
};

export const updateIntake = async (id: string, input: UpdateIntakeInput, actorId?: string) => {
  const before = await prisma.intake.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Intake not found");
  }

  if (input.code && input.code !== before.code) {
    const duplicate = await prisma.intake.findUnique({
      where: { code: input.code },
      select: { id: true },
    });
    if (duplicate) {
      throw conflict("An intake with this code already exists");
    }
  }

  const data: Prisma.IntakeUpdateInput = {
    code: input.code,
    name: input.name,
    startDate: input.startDate,
    endDate: input.endDate,
    enrollmentOpensAt: input.enrollmentOpensAt,
    enrollmentEndsAt: input.enrollmentEndsAt,
    currency: input.currency,
    isActive: input.isActive,
  };
  if (input.registrationFee !== undefined) {
    data.registrationFee = new Prisma.Decimal(input.registrationFee);
  }
  if (input.bookFee !== undefined) {
    data.bookFee = new Prisma.Decimal(input.bookFee);
  }

  const intake = await prisma.intake.update({ where: { id }, data });

  await writeAudit({
    actorId: actorId ?? null,
    action: "INTAKE_UPDATED",
    entityType: "Intake",
    entityId: intake.id,
    before,
    after: intake,
  });

  return intake;
};

export const deleteIntake = async (id: string, actorId?: string) => {
  const before = await prisma.intake.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Intake not found");
  }

  const intake = await prisma.intake.update({ where: { id }, data: { isActive: false } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "INTAKE_DISABLED",
    entityType: "Intake",
    entityId: intake.id,
    before,
    after: intake,
  });

  return intake;
};
