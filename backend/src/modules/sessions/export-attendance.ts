import type { Prisma,Role } from "../../generated/prisma/client.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { enforceAttendanceScope } from "./session-access.js";
import type {
AttendanceSummaryQuery
} from "./sessions.schema.js";
export const exportAttendance = async (
  query: AttendanceSummaryQuery,
  actor: { id: string; role: Role },
) => {
  const where: Prisma.AttendanceWhereInput = {};

  const sessionWhere: Prisma.ClassSessionWhereInput = { ...await enforceAttendanceScope(actor, query.classGroupId), status: { not: "CANCELLED" } };
  if (query.classGroupId) sessionWhere.classGroupId = query.classGroupId;
  if (query.from || query.to) sessionWhere.startAt = { gte: query.from, lte: query.to };
  if (Object.keys(sessionWhere).length > 0) {
    where.session = sessionWhere;
  }
  if (query.studentId) {
    where.studentId = query.studentId;
  } else if (actor.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!student) {
      throw notFound("Student profile not found");
    }
    where.studentId = student.id;
  }

  const rows = await prisma.attendance.findMany({
    where,
    orderBy: { session: { startAt: "desc" } },
    take: 5000,
    include: {
      student: {
        select: { studentCode: true, user: { select: { firstName: true, lastName: true } } },
      },
      session: {
        select: {
          title: true,
          startAt: true,
          classGroup: { select: { name: true } },
        },
      },
    },
  });

  return rows.map((row) => ({
    date: row.session.startAt.toISOString(),
    classGroup: row.session.classGroup.name,
    session: row.session.title,
    studentCode: row.student.studentCode,
    studentName: `${row.student.user.firstName} ${row.student.user.lastName}`.trim(),
    status: row.status,
    note: row.note ?? "",
  }));
};
