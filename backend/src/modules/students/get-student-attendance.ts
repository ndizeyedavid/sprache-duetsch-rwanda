import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { summarizeAttendance } from './summarize-attendance.js';
/** Every attendance mark for one student, newest session first, plus the summary. */
export const getStudentAttendance = async (studentId: string) => {
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true } });
  if (!student) {
    throw notFound("Student not found");
  }

  const rows = await prisma.attendance.findMany({
    where: { studentId: student.id },
    orderBy: { session: { startAt: "desc" } },
    include: {
      session: {
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          status: true,
          classGroup: { select: { id: true, code: true, name: true } },
        },
      },
    },
  });

  return {
    attendance: rows.map((row) => ({
      id: row.id,
      status: row.status,
      markedAt: row.markedAt,
      note: row.note,
      session: row.session,
    })),
    summary: summarizeAttendance(rows),
  };
};
