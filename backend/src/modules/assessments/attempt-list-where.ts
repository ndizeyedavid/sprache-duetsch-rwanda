import type { Prisma } from "../../generated/prisma/client.js";
import { andWhere,attemptIntakeWhere } from "../../lib/intake-scope.js";
import { prisma } from "../../lib/prisma.js";
import type { ListAttemptQuery } from "./assessments.schema.js";
import { teacherLevels } from "./teacher-access.js";

/** Shared filter for the staff attempts list and its CSV export. Teachers stay inside their classes + levels. */
export async function attemptListWhere(query: ListAttemptQuery, teacherId?: string): Promise<Prisma.AttemptWhereInput> {
  const levels = await teacherLevels(teacherId);
  const where: Prisma.AttemptWhereInput = teacherId ? { AND: [{ assessment: { levelId: { in: levels ?? [] } } }, { student: { enrollments: { some: { classGroup: { teacherId }, status: "ACTIVE" } } } }] } : {};
  if (query.assessmentId) where.assessmentId = query.assessmentId;
  if (query.studentId) {
    where.studentId = query.studentId;
  } else if (query.classGroupId) {
    const studentIds = await prisma.enrollment
      .findMany({ where: { classGroupId: query.classGroupId }, select: { studentId: true }, distinct: ["studentId"] })
      .then((rows) => rows.map((row) => row.studentId));
    where.studentId = { in: studentIds };
  }
  if (query.status) where.status = query.status;
  return andWhere(where, query.intakeId && attemptIntakeWhere(query.intakeId));
}
