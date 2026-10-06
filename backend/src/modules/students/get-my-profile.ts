import { recalculateStudentFinance } from "../../lib/finance.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import { summarizeAttendance } from './summarize-attendance.js';
export const getMyProfile = async (userId: string) => {
  const linked = await prisma.student.findUnique({ where: { userId }, select: { id: true } });
  if (linked) await recalculateStudentFinance(prisma, linked.id);
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      studentCode: true,
      user: { select: safeUserSelect },
      campus: { select: { id: true, code: true, name: true } },
      intake: { select: { id: true, code: true, name: true, startDate: true, endDate: true } },
      intendedLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
      currentLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
      finance: true,
      enrollments: {
        where: { status: { in: ["ACTIVE", "COMPLETED"] } },
        orderBy: { enrolledAt: "desc" },
        include: {
          level: { select: { id: true, code: true, title: true, levelLabel: true } },
          intake: { select: { id: true, code: true, name: true, startDate: true, endDate: true } },
          classGroup: { select: { id: true, code: true, name: true, shift: true } },
        },
      },
      attendance: { select: { status: true } },
      lessonProgress: { where: { status: "COMPLETED" }, select: { id: true } },
      _count: { select: { certificates: true } },
    },
  });

  if (!student) {
    throw notFound("Student profile not found");
  }

  const levels = student.enrollments.map(row => row.levelId);
  const released = { isPublished: true, OR: [{ releaseAt: null }, { releaseAt: { lte: new Date() } }] };
  const lessonsCompleted = await prisma.lessonProgress.count({ where: { studentId: student.id, status: "COMPLETED",
    lesson: { ...released, module: { ...released, levelId: { in: levels } } },
  } });
  return {
    user: student.user,
    studentCode: student.studentCode,
    campus: student.campus,
    intake: student.intake,
    intendedLevel: student.intendedLevel,
    currentLevel: student.currentLevel,
    finance: student.finance,
    enrollments: student.enrollments,
    attendance: summarizeAttendance(student.attendance),
    certificates: student._count.certificates,
    lessonsCompleted,
  };
};
