import { enforceAttendanceScope, loadScheduleAccess, protectStudentSession } from "./session-access.js";
import type { Prisma, AttendanceStatus, Role } from "../../generated/prisma/client.js";
import { assertTeacherOwnsClass } from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  AttendanceSummaryQuery,
  CreateSessionMaterialInput,
  ListSessionsQuery,
  StudentSessionsQuery,
} from "./sessions.schema.js";

const briefLevel = { select: { id: true, code: true, title: true, levelLabel: true } } as const;
const briefIntake = { select: { id: true, code: true, name: true } } as const;
const briefCampus = { select: { id: true, code: true, name: true } } as const;
const briefTeacher = { select: { id: true, firstName: true, lastName: true } } as const;

const classGroupDetailSelect = {
  id: true,
  name: true,
  level: briefLevel,
  intake: briefIntake,
  campus: briefCampus,
} as const;

// Lightweight shape for the mobile-first student views (low-bandwidth friendly).
// Includes room/notes/recording so the detail drawer renders essential info.
const studentSessionSelect = {
  id: true,
  title: true,
  startAt: true,
  endAt: true,
  timezone: true,
  mode: true,
  provider: true,
  status: true,
  meetingUrl: true,
  recordingUrl: true,
  room: true,
  notes: true,
  teacher: { select: { firstName: true, lastName: true } },
  classGroup: { select: { id: true, name: true } },
} as const;

const assertTeacherIfNeeded = async (
  actorId: string | undefined,
  actorRole: Role | undefined,
  classGroupId: string,
): Promise<void> => {
  if (actorRole === "TEACHER" && actorId) {
    await assertTeacherOwnsClass(actorId, classGroupId);
  }
};

export const listSessions = async (query: ListSessionsQuery, forcedTeacherId?: string) => {
  const pagination = parsePagination(query);

  const where: Prisma.ClassSessionWhereInput = {};
  if (query.classGroupId) where.classGroupId = query.classGroupId;
  if (query.status) where.status = query.status;
  if (query.teacherId) where.teacherId = query.teacherId;
  if (forcedTeacherId) where.AND = [{ classGroup: { teacherId: forcedTeacherId } }];
  if (query.from || query.to) where.startAt = { gte: query.from, lte: query.to };
  if (query.levelId || query.campusId || query.intakeId) {
    where.classGroup = {
      ...(query.levelId ? { levelId: query.levelId } : {}),
      ...(query.campusId ? { campusId: query.campusId } : {}),
      ...(query.intakeId ? { intakeId: query.intakeId } : {}),
    };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.classSession.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        classGroup: { select: classGroupDetailSelect },
        teacher: briefTeacher,
        _count: { select: { attendance: true } },
      },
    }),
    prisma.classSession.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const getSession = async (id: string) => {
  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      classGroup: { select: classGroupDetailSelect },
      teacher: briefTeacher,
      materials: { orderBy: { createdAt: "desc" } },
      attendance: {
        select: {
          id: true,
          status: true,
          note: true,
          markedAt: true,
          student: {
            select: {
              id: true,
              studentCode: true,
              user: { select: { firstName: true, lastName: true } },
            },
          },
        },
      },
    },
  });

  if (!session) {
    throw notFound("Session not found");
  }

  return session;
};

export { createSession, updateSession, cancelSession, rescheduleSession } from "./session-commands.js";

export const addSessionMaterial = async (
  sessionId: string,
  input: CreateSessionMaterialInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true, classGroupId: true, endAt: true },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, session.classGroupId);

  const material = await prisma.sessionMaterial.create({
    data: {
      sessionId,
      title: input.title,
      type: input.type,
      url: input.url ?? null,
      description: input.description ?? null,
      uploadedById: actorId ?? null,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_MATERIAL_CREATED",
    entityType: "SessionMaterial",
    entityId: material.id,
    after: material,
  });

  return material;
};

export const deleteSessionMaterial = async (
  materialId: string,
  actorId?: string,
  actorRole?: Role,
) => {
  const material = await prisma.sessionMaterial.findUnique({
    where: { id: materialId },
    include: { session: { select: { classGroupId: true } } },
  });
  if (!material) {
    throw notFound("Session material not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, material.session.classGroupId);

  await prisma.sessionMaterial.delete({ where: { id: materialId } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_MATERIAL_DELETED",
    entityType: "SessionMaterial",
    entityId: materialId,
    before: material,
  });

  return { id: materialId };
};

export const getSessionRoster = async (id: string) => {
  const session = await prisma.classSession.findUnique({
    where: { id },
    select: { id: true, classGroupId: true, endAt: true },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classGroupId: session.classGroupId, enrolledAt: { lte: session.endAt }, status: { in: ["ACTIVE", "COMPLETED"] } },
    orderBy: { enrolledAt: "asc" },
    select: {
      student: {
        select: {
          id: true,
          studentCode: true,
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          attendance: { where: { sessionId: id }, select: { status: true, note: true, markedAt: true, updatedAt: true, markedBy: { select: { firstName: true, lastName: true } } } },
        },
      },
    },
  });

  return enrollments.map((enrollment) => {
    const student = enrollment.student;
    const record = student.attendance[0];
    return {
      studentId: student.id,
      studentCode: student.studentCode,
      firstName: student.user.firstName,
      lastName: student.user.lastName,
      email: student.user.email,
      phone: student.user.phone,
      status: record?.status ?? null,
      note: record?.note ?? null,
      markedAt: record?.markedAt ?? null,
      updatedAt: record?.updatedAt ?? null,
      markedBy: record?.markedBy ?? null,
    };
  });
};

export { markAttendance, updateAttendance } from "./attendance-commands.js";

export interface AttendanceCounts {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  percentage: number;
}

// A session counts as attended when the student was present or late.
const countAttendance = (rows: { status: AttendanceStatus }[]): AttendanceCounts => {
  const counts: AttendanceCounts = {
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: rows.length,
    percentage: 0,
  };

  for (const row of rows) {
    if (row.status === "PRESENT") counts.present += 1;
    else if (row.status === "ABSENT") counts.absent += 1;
    else if (row.status === "LATE") counts.late += 1;
    else if (row.status === "EXCUSED") counts.excused += 1;
  }

  counts.percentage =
    counts.total > 0
      ? Math.round(((counts.present + counts.late) / counts.total) * 10000) / 100
      : 0;

  return counts;
};

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

export const getMyUpcomingSessions = async (userId: string) => {
  const profile = await loadScheduleAccess(userId);
  if (profile.classGroupIds.length === 0) {
    return [];
  }

  const rows = await prisma.classSession.findMany({
    where: {
      classGroupId: { in: profile.classGroupIds },
      endAt: { gt: new Date() },
      status: { in: ["SCHEDULED", "LIVE", "RESCHEDULED"] },
    },
    orderBy: { startAt: "asc" },
    select: studentSessionSelect,
  });
  return rows.map(row => protectStudentSession(row, profile));
};

export const getMySessions = async (userId: string, query: StudentSessionsQuery) => {
  const profile = await loadScheduleAccess(userId);
  const pagination = parsePagination(query);
  if (profile.classGroupIds.length === 0) {
    return buildPaginated([], 0, pagination);
  }

  const where: Prisma.ClassSessionWhereInput = {
    classGroupId: { in: profile.classGroupIds },
    ...(query.scope === "all" ? {} : { startAt: { lt: new Date() } }),
  };

  const [rows, total] = await prisma.$transaction([
    prisma.classSession.findMany({
      where,
      orderBy: { startAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      select: studentSessionSelect,
    }),
    prisma.classSession.count({ where }),
  ]);

  return buildPaginated(rows.map(row => protectStudentSession(row, profile)), total, pagination);
};

export const getMySession = async (userId: string, id: string) => {
  const profile = await loadScheduleAccess(userId);

  const session = await prisma.classSession.findUnique({
    where: { id },
    include: {
      teacher: briefTeacher,
      classGroup: { select: classGroupDetailSelect },
      materials: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  if (!profile.classGroupIds.includes(session.classGroupId)) {
    throw forbidden("You do not have access to this session");
  }

  const protectedSession = protectStudentSession(session, profile);
  return { ...protectedSession, materials: protectedSession.accessMessage ? [] : session.materials };
};
