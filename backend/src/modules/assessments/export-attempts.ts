import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type {
ListAttemptQuery
} from "./assessments.schema.js";
import { teacherLevels } from "./teacher-access.js";
export const exportAttempts = async (query: ListAttemptQuery, teacherId?: string) => {
  const levels = await teacherLevels(teacherId);
  const where: Prisma.AttemptWhereInput = teacherId ? { AND: [{ assessment: { levelId: { in: levels ?? [] } } }, { student: { enrollments: { some: { classGroup: { teacherId }, status: "ACTIVE" } } } }] } : {};
  if (query.assessmentId) {
    where.assessmentId = query.assessmentId;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  } else if (query.classGroupId) {
    const studentIds = await prisma.enrollment
      .findMany({
        where: { classGroupId: query.classGroupId },
        select: { studentId: true },
        distinct: ["studentId"],
      })
      .then((rows) => rows.map((row) => row.studentId));
    where.studentId = studentIds.length > 0 ? { in: studentIds } : { in: [] };
  }
  if (query.status) {
    where.status = query.status;
  }

  const rows = await prisma.attempt.findMany({
    where,
    orderBy: { startedAt: "desc" },
    take: 5000,
    include: {
      student: {
        select: { studentCode: true, user: { select: { firstName: true, lastName: true } } },
      },
      assessment: { select: { id: true, title: true } },
    },
  });

  return rows.map((row) => ({
    startedAt: row.startedAt.toISOString(),
    studentCode: row.student.studentCode,
    studentName: `${row.student.user.firstName} ${row.student.user.lastName}`.trim(),
    assessment: row.assessment.title,
    status: row.status,
    score: row.score?.toString() ?? "",
    maxScore: row.maxScore.toString(),
    passed: row.passed === null ? "" : String(row.passed),
    submittedAt: row.submittedAt?.toISOString() ?? "",
    gradedAt: row.gradedAt?.toISOString() ?? "",
  }));
};
