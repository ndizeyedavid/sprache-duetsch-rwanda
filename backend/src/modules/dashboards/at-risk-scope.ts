import type { Prisma,Role } from "../../generated/prisma/client.js";
import { assertTeacherOwnsClass } from "../../lib/access.js";

export interface AnalyticsActor { id: string; role: Role }
export interface AtRiskFilter { classGroupId?: string; levelId?: string; intakeId?: string; campusId?: string }

/** Active enrolments of active students. Teachers only ever reach their own classes. */
export async function atRiskEnrollmentWhere(actor: AnalyticsActor, filter: AtRiskFilter): Promise<Prisma.EnrollmentWhereInput> {
  const where: Prisma.EnrollmentWhereInput = { status: "ACTIVE", student: { status: "ACTIVE" } };
  if (filter.levelId) where.levelId = filter.levelId;
  if (filter.intakeId) where.intakeId = filter.intakeId;
  if (filter.campusId) where.campusId = filter.campusId;
  if (filter.classGroupId) where.classGroupId = filter.classGroupId;
  if (actor.role === "TEACHER") {
    if (filter.classGroupId) await assertTeacherOwnsClass(actor.id, filter.classGroupId);
    where.classGroup = { teacherId: actor.id };
  }
  return where;
}

/** Academic fields only — never totalFee/discounts (finance stays out of this view). */
export const atRiskEnrollmentSelect = {
  id: true, studentId: true, levelId: true, classGroupId: true, enrolledAt: true,
  student: { select: { studentCode: true, user: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
  level: { select: { id: true, code: true, attendanceAlertThreshold: true } },
  intake: { select: { id: true, name: true } },
  classGroup: { select: { id: true, code: true, name: true, attendanceAlertThreshold: true } },
} satisfies Prisma.EnrollmentSelect;
