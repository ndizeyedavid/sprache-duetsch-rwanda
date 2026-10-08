import type { Prisma } from '../generated/prisma/client.js';
import { allocateObligations } from './finance-policy.js';

type Enrollment = { id: string; levelId: string; totalFee: Prisma.Decimal; enrolledAt: Date };
type Charge = { id: string; enrollmentId: string | null; type: string; amount: Prisma.Decimal; dueDate: Date | null; createdAt: Date };

/** Reuse ledger allocation so course access and the displayed balance agree. */
export function paidCourseEnrollments<T extends Enrollment>(enrollments: T[], charges: Charge[], credit: Prisma.Decimal): T[] {
  const allocated = allocateObligations(charges, credit).obligations;
  const latest = new Map<string, T>();
  for (const enrollment of enrollments) {
    const previous = latest.get(enrollment.levelId);
    const newer = !previous || enrollment.enrolledAt > previous.enrolledAt
      || (enrollment.enrolledAt.getTime() === previous.enrolledAt.getTime() && enrollment.id > previous.id);
    if (newer) latest.set(enrollment.levelId, enrollment);
  }
  return [...latest.values()].filter(enrollment => {
    if (enrollment.totalFee.isZero()) return true;
    const tuition = allocated.filter(charge => charge.enrollmentId === enrollment.id && charge.type === 'TUITION');
    return tuition.length > 0 && tuition.every(charge => charge.outstanding.isZero());
  });
}

export function paidCourseLevels(enrollments: Enrollment[], charges: Charge[], credit: Prisma.Decimal): string[] {
  return paidCourseEnrollments(enrollments, charges, credit).map(enrollment => enrollment.levelId);
}
