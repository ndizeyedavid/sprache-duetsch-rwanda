import type { AttendanceStatus,Prisma,Role } from "../../generated/prisma/client.js";
import { forbidden,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { countAttendance } from './count-attendance.js';
import { enforceAttendanceScope } from "./session-access.js";
import type {
AttendanceSummaryQuery
} from "./sessions.schema.js";
export const getAttendanceSummary = async (
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

  if (actor.role === "STUDENT") {
    const student = await prisma.student.findUnique({
      where: { userId: actor.id },
      select: { id: true },
    });
    if (!student) {
      throw notFound("Student profile not found");
    }
    if (query.studentId && query.studentId !== student.id) {
      throw forbidden("You can only view your own attendance");
    }
    where.studentId = student.id;
  } else if (query.studentId) {
    where.studentId = query.studentId;
  }

  const rows = await prisma.attendance.findMany({
    where,
    select: { studentId: true, status: true },
  });

  const grouped = new Map<string, { status: AttendanceStatus }[]>();
  for (const row of rows) {
    const list = grouped.get(row.studentId) ?? [];
    list.push({ status: row.status });
    grouped.set(row.studentId, list);
  }

  return [...grouped.entries()]
    .map(([studentId, statuses]) => ({ studentId, ...countAttendance(statuses) }))
    .sort((a, b) => a.studentId.localeCompare(b.studentId));
};
