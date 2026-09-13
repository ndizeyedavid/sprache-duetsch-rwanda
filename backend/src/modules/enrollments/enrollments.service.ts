import { Prisma } from "../../generated/prisma/client.js";
import { emitActivity } from "../activity/activity.service.js";
import { writeAudit } from "../../lib/audit.js";
import { recalculateStudentFinance } from "../../lib/finance.js";
import { badRequest, conflict, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateEnrollmentInput,
  ListEnrollmentsQuery,
  UpdateEnrollmentInput,
} from "./enrollments.schema.js";

const studentSummarySelect = {
  id: true,
  studentCode: true,
  user: { select: { firstName: true, lastName: true, email: true } },
} as const;

const levelSummarySelect = {
  id: true,
  code: true,
  title: true,
  levelLabel: true,
} as const;

const intakeSummarySelect = {
  id: true,
  code: true,
  name: true,
} as const;

const classGroupSummarySelect = {
  id: true,
  code: true,
  name: true,
  shift: true,
} as const;

export const getMyEnrollments = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw notFound("Student profile not found");
  }

  return prisma.enrollment.findMany({
    where: { studentId: student.id },
    orderBy: { enrolledAt: "desc" },
    include: {
      level: { select: levelSummarySelect },
      intake: { select: { ...intakeSummarySelect, startDate: true, endDate: true } },
      classGroup: { select: classGroupSummarySelect },
      campus: { select: { id: true, code: true, name: true } },
    },
  });
};

export const listEnrollments = async (query: ListEnrollmentsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.EnrollmentWhereInput = {};
  if (query.studentId) where.studentId = query.studentId;
  if (query.levelId) where.levelId = query.levelId;
  if (query.intakeId) where.intakeId = query.intakeId;
  if (query.campusId) where.campusId = query.campusId;
  if (query.classGroupId) where.classGroupId = query.classGroupId;
  if (query.status) where.status = query.status;

  const [rows, total] = await prisma.$transaction([
    prisma.enrollment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        student: { select: studentSummarySelect },
        level: { select: levelSummarySelect },
        intake: { select: intakeSummarySelect },
        classGroup: { select: classGroupSummarySelect },
      },
    }),
    prisma.enrollment.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getEnrollment = async (id: string) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id },
    include: {
      student: { select: studentSummarySelect },
      level: true,
      intake: true,
      campus: true,
      classGroup: true,
      charges: true,
      payments: true,
      discounts: true,
      certificates: true,
    },
  });

  if (!enrollment) {
    throw notFound("Enrollment not found");
  }

  return enrollment;
};

export const createEnrollment = async (input: CreateEnrollmentInput, actorId?: string) => {
  const student = await prisma.student.findUnique({
    where: { id: input.studentId },
    select: { id: true, campusId: true, currentLevelId: true },
  });
  if (!student) {
    throw notFound("Student not found");
  }

  const level = await prisma.level.findUnique({ where: { id: input.levelId } });
  if (!level) {
    throw notFound("Level not found");
  }

  const intake = await prisma.intake.findUnique({ where: { id: input.intakeId } });
  if (!intake) {
    throw notFound("Intake not found");
  }

  if (input.classGroupId) {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: input.classGroupId },
      select: { id: true, levelId: true },
    });
    if (!classGroup) {
      throw notFound("Class group not found");
    }
    if (classGroup.levelId !== input.levelId) {
      throw badRequest("Class group does not belong to the selected level");
    }
  }

  if (input.campusId) {
    const campus = await prisma.campus.findUnique({
      where: { id: input.campusId },
      select: { id: true },
    });
    if (!campus) {
      throw badRequest("Campus not found");
    }
  }

  const campusId = input.campusId ?? student.campusId;
  if (!campusId) {
    throw badRequest("Campus is required");
  }

  const existing = await prisma.enrollment.findUnique({
    where: {
      studentId_levelId_intakeId: {
        studentId: input.studentId,
        levelId: input.levelId,
        intakeId: input.intakeId,
      },
    },
    select: { id: true },
  });
  if (existing) {
    throw conflict("Student is already enrolled in this level for this intake");
  }

  const totalFee = new Prisma.Decimal(input.totalFee ?? level.defaultFee);
  const discountTotal = new Prisma.Decimal(input.discountTotal ?? 0);
  const currency = input.currency ?? level.currency;

  const enrollment = await prisma.$transaction(async (tx) => {
    const created = await tx.enrollment.create({
      data: {
        studentId: input.studentId,
        levelId: input.levelId,
        intakeId: input.intakeId,
        campusId,
        classGroupId: input.classGroupId ?? null,
        status: "ACTIVE",
        totalFee,
        discountTotal,
        currency,
        enrolledAt: new Date(),
      },
    });

    await tx.charge.create({
      data: {
        studentId: input.studentId,
        enrollmentId: created.id,
        type: "TUITION",
        description: `Tuition - ${level.title} (${intake.code})`,
        amount: totalFee,
        currency,
        dueDate: input.dueDate ? new Date(input.dueDate) : intake.endDate,
        createdById: actorId ?? null,
      },
    });

    // Keep the student profile consistent with the new enrollment.
    await tx.student.update({
      where: { id: input.studentId },
      data: {
        campusId,
        intakeId: input.intakeId,
        ...(student.currentLevelId ? {} : { currentLevelId: input.levelId }),
      },
    });

    await recalculateStudentFinance(tx, input.studentId);

    return created;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ENROLLMENT_CREATED",
    entityType: "Enrollment",
    entityId: enrollment.id,
    after: enrollment,
  });

  await emitActivity({
    actorId,
    type: "ENROLLMENT",
    title: `New enrolment in ${level.title}`,
    body: `Enrolled for intake ${intake.code}.`,
    levelId: input.levelId,
    classGroupId: input.classGroupId ?? null,
    studentId: input.studentId,
  });

  return enrollment;
};

export const updateEnrollment = async (
  id: string,
  input: UpdateEnrollmentInput,
  actorId?: string,
) => {
  const before = await prisma.enrollment.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Enrollment not found");
  }

  if (input.classGroupId) {
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: input.classGroupId },
      select: { levelId: true },
    });
    if (!classGroup) {
      throw notFound("Class group not found");
    }
    if (classGroup.levelId !== before.levelId) {
      throw badRequest("Class group does not belong to this level");
    }
  }

  const totalFee =
    input.totalFee !== undefined ? new Prisma.Decimal(input.totalFee) : before.totalFee;
  const discountTotal =
    input.discountTotal !== undefined
      ? new Prisma.Decimal(input.discountTotal)
      : before.discountTotal;

  const updated = await prisma.$transaction(async (tx) => {
    const enrollment = await tx.enrollment.update({
      where: { id },
      data: {
        classGroupId: input.classGroupId,
        status: input.status,
        totalFee,
        discountTotal,
        completedAt: input.status === "COMPLETED" ? new Date() : undefined,
      },
    });

    // The linked tuition charge mirrors the enrollment fee so finance stays authoritative.
    if (input.totalFee !== undefined) {
      await tx.charge.updateMany({
        where: { enrollmentId: id, type: "TUITION" },
        data: { amount: totalFee },
      });
      await recalculateStudentFinance(tx, before.studentId);
    }

    return enrollment;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ENROLLMENT_UPDATED",
    entityType: "Enrollment",
    entityId: id,
    before,
    after: updated,
  });

  return updated;
};
