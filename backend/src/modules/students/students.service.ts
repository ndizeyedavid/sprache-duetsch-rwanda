import type { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { badRequest, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type { ListStudentsQuery, PlacementInput, UpdateStudentInput } from "./students.schema.js";

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
}

// A session counts as attended when the student was present or late.
const summarizeAttendance = (rows: { status: string }[]): AttendanceSummary => {
  const summary: AttendanceSummary = {
    total: rows.length,
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    percentage: 0,
  };

  for (const row of rows) {
    if (row.status === "PRESENT") summary.present += 1;
    else if (row.status === "ABSENT") summary.absent += 1;
    else if (row.status === "LATE") summary.late += 1;
    else if (row.status === "EXCUSED") summary.excused += 1;
  }

  summary.percentage =
    summary.total > 0
      ? Math.round(((summary.present + summary.late) / summary.total) * 100)
      : 0;

  return summary;
};

const safeUserSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  avatarUrl: true,
  status: true,
} as const;

export const getMyProfile = async (userId: string) => {
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
        where: { status: "ACTIVE" },
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
    lessonsCompleted: student.lessonProgress.length,
  };
};

export const getMyAttendance = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    throw notFound("Student profile not found");
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

export const getMyProgress = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      enrollments: {
        where: { status: "ACTIVE" },
        orderBy: { enrolledAt: "asc" },
        select: { levelId: true },
      },
    },
  });

  if (!student) {
    throw notFound("Student profile not found");
  }

  const levelIds = [...new Set(student.enrollments.map((enrollment) => enrollment.levelId))];
  if (levelIds.length === 0) {
    return { levels: [], overallPercentage: 0 };
  }

  const levels = await prisma.level.findMany({
    where: { id: { in: levelIds } },
    orderBy: { order: "asc" },
    select: {
      id: true,
      code: true,
      title: true,
      levelLabel: true,
      order: true,
      modules: {
        where: { isPublished: true },
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          lessons: {
            where: { isPublished: true },
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              order: true,
              progress: {
                where: { studentId: student.id },
                select: { status: true, completedAt: true },
              },
            },
          },
        },
      },
    },
  });

  let totalLessons = 0;
  let completedLessons = 0;

  const levelSummaries = levels.map((level) => {
    let levelTotal = 0;
    let levelCompleted = 0;

    const modules = level.modules.map((module) => {
      const lessons = module.lessons.map((lesson) => {
        const progress = lesson.progress[0];
        const status = progress?.status ?? "NOT_STARTED";
        levelTotal += 1;
        if (status === "COMPLETED") levelCompleted += 1;
        return {
          id: lesson.id,
          title: lesson.title,
          order: lesson.order,
          status,
          completedAt: progress?.completedAt ?? null,
        };
      });

      return { id: module.id, title: module.title, order: module.order, lessons };
    });

    totalLessons += levelTotal;
    completedLessons += levelCompleted;

    return {
      level: {
        id: level.id,
        code: level.code,
        title: level.title,
        levelLabel: level.levelLabel,
        order: level.order,
      },
      modules,
      completionPercentage: levelTotal > 0 ? Math.round((levelCompleted / levelTotal) * 100) : 0,
    };
  });

  return {
    levels: levelSummaries,
    overallPercentage:
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
  };
};

export const listStudents = async (query: ListStudentsQuery) => {
  const pagination = parsePagination(query);

  const where: Prisma.StudentWhereInput = {};
  if (query.campusId) where.campusId = query.campusId;
  if (query.intakeId) where.intakeId = query.intakeId;
  if (query.currentLevelId) where.currentLevelId = query.currentLevelId;
  if (query.status) where.status = query.status;
  if (query.shift) where.shift = query.shift;
  if (query.search) {
    where.OR = [
      { studentCode: { contains: query.search, mode: "insensitive" } },
      { user: { email: { contains: query.search, mode: "insensitive" } } },
      { user: { firstName: { contains: query.search, mode: "insensitive" } } },
      { user: { lastName: { contains: query.search, mode: "insensitive" } } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.student.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        user: { select: safeUserSelect },
        campus: { select: { id: true, code: true, name: true } },
        intake: { select: { id: true, code: true, name: true } },
        currentLevel: { select: { id: true, code: true, title: true, levelLabel: true } },
        finance: true,
      },
    }),
    prisma.student.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

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

const assertCampusExists = async (campusId: string): Promise<void> => {
  const campus = await prisma.campus.findUnique({ where: { id: campusId }, select: { id: true } });
  if (!campus) {
    throw badRequest("Campus not found");
  }
};

const assertIntakeExists = async (intakeId: string): Promise<void> => {
  const intake = await prisma.intake.findUnique({ where: { id: intakeId }, select: { id: true } });
  if (!intake) {
    throw badRequest("Intake not found");
  }
};

const assertLevelExists = async (levelId: string): Promise<void> => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw badRequest("Level not found");
  }
};

export const updateStudent = async (
  id: string,
  input: UpdateStudentInput,
  actorId?: string,
) => {
  const before = await prisma.student.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Student not found");
  }

  if (input.campusId) await assertCampusExists(input.campusId);
  if (input.intakeId) await assertIntakeExists(input.intakeId);
  if (input.intendedLevelId) await assertLevelExists(input.intendedLevelId);
  if (input.currentLevelId) await assertLevelExists(input.currentLevelId);

  const updated = await prisma.$transaction(async (tx) => {
    const student = await tx.student.update({
      where: { id },
      data: {
        campusId: input.campusId,
        intakeId: input.intakeId,
        intendedLevelId: input.intendedLevelId,
        currentLevelId: input.currentLevelId,
        shift: input.shift,
        status: input.status,
        gender: input.gender,
        nationalId: input.nationalId,
        address: input.address,
        guardianName: input.guardianName,
        guardianPhone: input.guardianPhone,
        dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined,
      },
    });

    // Account status lives on both User and Student; keep them in sync.
    if (input.status) {
      await tx.user.update({ where: { id: student.userId }, data: { status: input.status } });
    }

    return student;
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "STUDENT_UPDATED",
    entityType: "Student",
    entityId: id,
    before,
    after: updated,
  });

  return updated;
};

const getLevelOrThrow = async (levelId: string) => {
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) {
    throw badRequest("Level not found");
  }
  return level;
};

// score buckets of 25 map onto the ordered levels (0 -> A1, 1 -> A2, 2 -> B1, 3 -> B2).
const recommendLevelByScore = async (score: number) => {
  const levels = await prisma.level.findMany({ orderBy: { order: "asc" } });
  if (levels.length === 0) {
    throw badRequest("No levels are configured");
  }
  const index = Math.min(Math.max(Math.floor(score / 25), 0), levels.length - 1);
  return levels[index];
};

export const runPlacement = async (id: string, input: PlacementInput, actorId?: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, placementScore: true, intendedLevelId: true },
  });

  if (!student) {
    throw notFound("Student not found");
  }

  const recommendedLevel = input.recommendedLevelId
    ? await getLevelOrThrow(input.recommendedLevelId)
    : await recommendLevelByScore(input.score);

  await prisma.student.update({
    where: { id },
    data: { placementScore: input.score, intendedLevelId: recommendedLevel.id },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "STUDENT_PLACEMENT_COMPLETED",
    entityType: "Student",
    entityId: id,
    before: { placementScore: student.placementScore, intendedLevelId: student.intendedLevelId },
    after: {
      placementScore: input.score,
      intendedLevelId: recommendedLevel.id,
      note: input.note ?? null,
    },
  });

  return { score: input.score, recommendedLevel };
};
