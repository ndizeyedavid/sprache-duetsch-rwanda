import { prisma } from "../../lib/prisma.js";
import type {
ListAttemptQuery
} from "./assessments.schema.js";
import { attemptListWhere } from "./attempt-list-where.js";
export const exportAttempts = async (query: ListAttemptQuery, teacherId?: string) => {
  const where = await attemptListWhere(query, teacherId);

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
