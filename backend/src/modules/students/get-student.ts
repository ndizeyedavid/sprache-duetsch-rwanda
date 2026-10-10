import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import { summarizeAttendance } from './summarize-attendance.js';
export const getStudent = async (id: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      user: { select: safeUserSelect },
      campus: { select: { id: true, code: true, name: true } },
      intake: { select: { id: true, code: true, name: true, startDate: true, endDate: true } },
      intendedLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
      currentLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
      finance: true,
      enrollments: {
        orderBy: { enrolledAt: "desc" },
        include: {
          level: { select: { id: true, code: true, title: true, levelLabel: true } },
          intake: { select: { id: true, code: true, name: true } },
          classGroup: { select: { id: true, code: true, name: true, shift: true } },
        },
      },
      attendance: { select: { status: true } },
      certificates: true,
      _count: { select: { attempts: true } },
    },
  });

  if (!student) {
    throw notFound("Student not found");
  }

  const { attendance, _count, ...rest } = student;

  return {
    ...rest,
    attendance: summarizeAttendance(attendance),
    attemptsCount: _count.attempts,
  };
};
