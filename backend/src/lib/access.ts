import { env } from "../config/env.js";
import type { AccountStatus,PaymentStatus } from "../generated/prisma/client.js";
import { recalculateStudentFinance } from "./finance.js";
import { forbidden,notFound } from "./http-error.js";
import { prisma } from "./prisma.js";
import { paidCourseEnrollments } from './course-payment-access.js';

// Snapshot of what a student account is allowed to reach. Built once per request.
export interface StudentAccessProfile {
  studentId: string;
  status: AccountStatus;
  currentLevelId: string | null;
  levelIds: string[];
  enrolledLevelIds: string[];
  coursePaymentsChecked: boolean;
  classGroupIds: string[];
  paymentStatus: PaymentStatus | null;
  balance: number;
  overdueAmount: number;
}

export const loadStudentAccessProfile = async (userId: string): Promise<StudentAccessProfile> => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      status: true,
      currentLevelId: true,
      finance: { select: { status: true, balance: true } },
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        select: { id: true, levelId: true, classGroupId: true, totalFee: true, enrolledAt: true },
      },
    },
  });

  if (!student) {
    throw forbidden("No student profile is linked to this account");
  }

  const finance = await recalculateStudentFinance(prisma, student.id);
  const charges = await prisma.charge.findMany({ where: { studentId: student.id } });
  const paidEnrollments = paidCourseEnrollments(student.enrollments, charges, finance.totalPaid.plus(finance.totalDiscount));

  const levelIds = paidEnrollments.map(row => row.levelId);
  const classGroupIds: string[] = [];
  for (const enrollment of paidEnrollments) {
    if (enrollment.classGroupId) {
      classGroupIds.push(enrollment.classGroupId);
    }
  }

  return {
    studentId: student.id,
    status: student.status,
    currentLevelId: student.currentLevelId,
    levelIds,
    enrolledLevelIds: [...new Set(student.enrollments.map(row => row.levelId))],
    coursePaymentsChecked: true,
    classGroupIds,
    paymentStatus: finance.status ?? null,
    balance: Number(finance.balance),
    overdueAmount: Number(finance.overdueAmount),
  };
};

const BLOCKED_ACCOUNT_STATUSES: AccountStatus[] = ["SUSPENDED", "WITHDRAWN"];

export const assertAccountActive = (profile: StudentAccessProfile): void => {
  if (BLOCKED_ACCOUNT_STATUSES.includes(profile.status)) {
    throw forbidden(`Account is ${profile.status.toLowerCase()}`);
  }
};

export const assertLevelAccess = async (userId: string, levelId: string): Promise<void> => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  if (!profile.levelIds.includes(levelId)) {
    if (profile.enrolledLevelIds.includes(levelId)) throw forbidden('Complete payment for this course to unlock its learning content');
    throw forbidden("You do not have access to this level");
  }
};

export type PaidResource = "LESSON" | "ASSESSMENT" | "LIVE_SESSION";

/**
 * Payment-aware access control. Kept deliberately separate from academic progress:
 * the academics never change, only whether a given resource type opens.
 */
export const assertPaymentAccess = (
  profile: StudentAccessProfile,
  resource: PaidResource,
): void => {
  // Course-level entitlement already restricts the level/class IDs above. A debt
  // on another course must not block a course the student has fully paid for.
  if (profile.coursePaymentsChecked) return;
  if (env.UNPAID_ACCESS === "FULL") {
    return;
  }

  const owing = profile.overdueAmount > 0;
  if (!owing) {
    return;
  }

  if (env.UNPAID_ACCESS === "NONE") {
    throw forbidden("Payment required to access this content");
  }

  // LIMITED: notes, lessons and live classes stay open; graded work does not.
  if (resource === "ASSESSMENT") {
    throw forbidden("Payment required to take assessments");
  }
};

export const assertTeacherOwnsClass = async (
  teacherId: string,
  classGroupId: string,
): Promise<void> => {
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: classGroupId },
    select: { teacherId: true },
  });

  if (!classGroup) {
    throw notFound("Class not found");
  }

  if (classGroup.teacherId !== teacherId) {
    throw forbidden("You are not assigned to this class");
  }
};
