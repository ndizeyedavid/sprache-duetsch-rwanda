import type { Prisma } from "../../generated/prisma/client.js";
import { notFound } from "../../lib/http-error.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListEnrollmentsQuery,
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
        charges: { select: { id: true, type: true, amount: true, dueDate: true } },
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

export { createEnrollment,updateEnrollment } from "./enrollment-commands.js";
