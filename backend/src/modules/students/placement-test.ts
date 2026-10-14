import type { AccountStatus,Prisma } from "../../generated/prisma/client.js";
import { forbidden } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";

type Client = Prisma.TransactionClient | typeof prisma;

/** The newest published PLACEMENT assessment is the placement test; null when none exists. */
export const findPlacementTest = (client: Client = prisma) =>
  client.assessment.findFirst({
    where: { type: "PLACEMENT", isPublished: true },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      durationMinutes: true,
      maxAttempts: true,
      passMark: true,
      _count: { select: { questions: true } },
    },
  });

const BLOCKED: AccountStatus[] = ["SUSPENDED", "WITHDRAWN"];

/**
 * Placement is open to every student account that is not suspended or withdrawn,
 * including PENDING applicants with no enrolment or payment yet.
 */
export const loadPlacementStudent = async (userId: string, client: Client = prisma) => {
  const student = await client.student.findUnique({
    where: { userId },
    select: { id: true, status: true, intendedLevelId: true, user: { select: { firstName: true, lastName: true } } },
  });
  if (!student) throw forbidden("No student profile is linked to this account");
  if (BLOCKED.includes(student.status)) throw forbidden(`Account is ${student.status.toLowerCase()}`);
  return student;
};

/** Deadline of a timed attempt, or null for untimed tests. */
export const attemptDeadline = (startedAt: Date, durationMinutes: number | null | undefined): Date | null =>
  durationMinutes ? new Date(startedAt.getTime() + durationMinutes * 60000) : null;
