import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { countAttendance } from './count-attendance.js';
import { loadScheduleAccess } from "./session-access.js";
export const getMyAttendance = async (userId: string) => {
  await loadScheduleAccess(userId);
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw notFound("Student profile not found");
  }

  const history = await prisma.attendance.findMany({
    where: { studentId: student.id, session: { status: { not: "CANCELLED" } } },
    orderBy: { session: { startAt: "desc" } },
    select: {
      id: true,
      status: true,
      note: true,
      markedAt: true,
      session: {
        select: {
          id: true,
          title: true,
          startAt: true,
          endAt: true,
          classGroup: { select: { id: true, name: true } },
        },
      },
    },
  });

  return {
    history,
    summary: countAttendance(history),
  };
};
