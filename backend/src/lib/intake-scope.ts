import type { Prisma } from "../generated/prisma/client.js";

/**
 * Single source of truth for "does this row belong to intake X" (the staff intake switcher).
 *
 * Ledger-style rows (charges, payments, discounts, attempts, certificates) carry an optional
 * enrollmentId plus a studentId. Rule: when the row is linked to an enrolment, the enrolment's
 * intake wins; otherwise it falls back to the student's current intake (Student.intakeId).
 *
 * Students belong to an intake when they hold any enrolment in it. A student with no enrolment
 * at all (fresh registration / placement) falls back to Student.intakeId.
 */

/** The intake a ledger row is attributed to — the in-memory twin of the where-builders below. */
export const resolveIntakeId = (row: {
  enrollment?: { intakeId: string } | null;
  student?: { intakeId: string | null } | null;
}): string | null => row.enrollment?.intakeId ?? row.student?.intakeId ?? null;

const linkedIntakeWhere = (intakeId: string) => ({
  OR: [
    { enrollment: { is: { intakeId } } },
    { enrollmentId: null, student: { is: { intakeId } } },
  ],
});

export const chargeIntakeWhere = (intakeId: string): Prisma.ChargeWhereInput => linkedIntakeWhere(intakeId);
export const paymentIntakeWhere = (intakeId: string): Prisma.PaymentWhereInput => linkedIntakeWhere(intakeId);
export const discountIntakeWhere = (intakeId: string): Prisma.DiscountWhereInput => linkedIntakeWhere(intakeId);
export const attemptIntakeWhere = (intakeId: string): Prisma.AttemptWhereInput => linkedIntakeWhere(intakeId);
export const certificateIntakeWhere = (intakeId: string): Prisma.CertificateWhereInput => linkedIntakeWhere(intakeId);
export const receiptIntakeWhere = (intakeId: string): Prisma.ReceiptWhereInput => ({ payment: paymentIntakeWhere(intakeId) });

export const studentIntakeWhere = (intakeId: string): Prisma.StudentWhereInput => ({
  OR: [
    { enrollments: { some: { intakeId } } },
    { intakeId, enrollments: { none: {} } },
  ],
});

/** Sessions and attendance follow their class group, which always has exactly one intake. */
export const sessionIntakeWhere = (intakeId: string): Prisma.ClassSessionWhereInput => ({ classGroup: { intakeId } });
export const attendanceIntakeWhere = (intakeId: string): Prisma.AttendanceWhereInput => ({ session: sessionIntakeWhere(intakeId) });

/**
 * Appends `extra` to `where.AND` without clobbering existing OR/AND clauses. No-op when
 * `extra` is undefined, so callers can write `andWhere(where, intakeId && builder(intakeId))`.
 */
export function andWhere<T extends { AND?: T | T[] }>(where: T, extra: T | undefined | "" | null): T {
  if (!extra) return where;
  const current = where.AND === undefined ? [] : Array.isArray(where.AND) ? where.AND : [where.AND];
  where.AND = [...current, extra];
  return where;
}
