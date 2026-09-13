import { env } from "../config/env.js";
import type { AccountStatus, PaymentStatus } from "../generated/prisma/client.js";
import { forbidden, notFound } from "./http-error.js";
import { prisma } from "./prisma.js";

// Snapshot of what a student account is allowed to reach. Built once per request.
export interface StudentAccessProfile {
  studentId: string;
  status: AccountStatus;
  currentLevelId: string | null;
  levelIds: string[];
  classGroupIds: string[];
  paymentStatus: PaymentStatus | null;
  balance: number;
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
        where: { status: "ACTIVE" },
        select: { levelId: true, classGroupId: true },
      },
    },
  });

  if (!student) {
    throw forbidden("No student profile is linked to this account");
  }

  const levelIds = new Set<string>();
  if (student.currentLevelId) {
    levelIds.add(student.currentLevelId);
  }

  const classGroupIds: string[] = [];
  for (const enrollment of student.enrollments) {
    levelIds.add(enrollment.levelId);
    if (enrollment.classGroupId) {
      classGroupIds.push(enrollment.classGroupId);
    }
  }

  return {
    studentId: student.id,
    status: student.status,
    currentLevelId: student.currentLevelId,
    levelIds: [...levelIds],
    classGroupIds,
    paymentStatus: student.finance?.status ?? null,
    balance: student.finance ? Number(student.finance.balance) : 0,
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
  if (env.UNPAID_ACCESS === "FULL") {
    return;
  }

  const owing = profile.balance > 0 || profile.paymentStatus === "OVERDUE";
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
