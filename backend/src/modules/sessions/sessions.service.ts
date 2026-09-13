import type { Prisma, AttendanceStatus, Role } from "../../generated/prisma/client.js";
import { assertTeacherOwnsClass, loadStudentAccessProfile } from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { env } from "../../config/env.js";
import { badRequest, forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  AttendanceSummaryQuery,
  CancelSessionInput,
  CreateSessionInput,
  CreateSessionMaterialInput,
  ListSessionsQuery,
  MarkAttendanceInput,
  RescheduleSessionInput,
  StudentSessionsQuery,
  UpdateAttendanceInput,
  UpdateSessionInput,
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
  const teacherId = forcedTeacherId ?? query.teacherId;
  if (teacherId) where.teacherId = teacherId;
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

export const createSession = async (
  input: CreateSessionInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const classGroup = await prisma.classGroup.findUnique({
    where: { id: input.classGroupId },
    select: { id: true, teacherId: true },
  });
  if (!classGroup) {
    throw notFound("Class group not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, input.classGroupId);

  if (input.startAt >= input.endAt) {
    throw badRequest("startAt must be before endAt");
  }
  if ((input.mode === "ONLINE" || input.mode === "HYBRID") && !input.meetingUrl) {
    throw badRequest("meetingUrl is required for online or hybrid sessions");
  }

  const session = await prisma.classSession.create({
    data: {
      classGroupId: input.classGroupId,
      teacherId: input.teacherId ?? classGroup.teacherId ?? null,
      title: input.title ?? null,
      mode: input.mode,
      provider: input.provider,
      meetingUrl: input.meetingUrl ?? null,
      startAt: input.startAt,
      endAt: input.endAt,
      timezone: input.timezone ?? "Africa/Kigali",
      room: input.room ?? null,
      recordingUrl: input.recordingUrl ?? null,
      notes: input.notes ?? null,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_CREATED",
    entityType: "ClassSession",
    entityId: session.id,
    after: session,
  });

  return session;
};

export const updateSession = async (
  id: string,
  input: UpdateSessionInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const before = await prisma.classSession.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Session not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, before.classGroupId);

  const startAt = input.startAt ?? before.startAt;
  const endAt = input.endAt ?? before.endAt;
  if (startAt >= endAt) {
    throw badRequest("startAt must be before endAt");
  }

  const mode = input.mode ?? before.mode;
  const meetingUrl = input.meetingUrl ?? before.meetingUrl;
  if ((mode === "ONLINE" || mode === "HYBRID") && !meetingUrl) {
    throw badRequest("meetingUrl is required for online or hybrid sessions");
  }

  const session = await prisma.classSession.update({
    where: { id },
    data: {
      title: input.title,
      mode: input.mode,
      provider: input.provider,
      meetingUrl: input.meetingUrl,
      startAt: input.startAt,
      endAt: input.endAt,
      timezone: input.timezone,
      room: input.room,
      status: input.status,
      recordingUrl: input.recordingUrl,
      notes: input.notes,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_UPDATED",
    entityType: "ClassSession",
    entityId: id,
    before,
    after: session,
  });

  return session;
};

const notifyEnrolledStudents = async (
  classGroupId: string,
  title: string,
  body: string,
  data: Prisma.InputJsonValue,
): Promise<void> => {
  const enrollments = await prisma.enrollment.findMany({
    where: { classGroupId, status: "ACTIVE" },
    select: { student: { select: { userId: true } } },
  });
  const userIds = [...new Set(enrollments.map((enrollment) => enrollment.student.userId))];
  if (userIds.length === 0) {
    return;
  }

  await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      type: "SCHEDULE",
      channel: "IN_APP",
      title,
      body,
      data,
    })),
  });
};

export const cancelSession = async (
  id: string,
  input: CancelSessionInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const before = await prisma.classSession.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Session not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, before.classGroupId);

  const session = await prisma.classSession.update({
    where: { id },
    data: { status: "CANCELLED" },
  });

  await notifyEnrolledStudents(
    before.classGroupId,
    "Class cancelled",
    `${session.title ?? "A class"} scheduled for ${session.startAt.toISOString()} was cancelled.${
      input.reason ? ` Reason: ${input.reason}` : ""
    }`,
    { sessionId: session.id, status: "CANCELLED", reason: input.reason ?? null },
  );

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_CANCELLED",
    entityType: "ClassSession",
    entityId: id,
    before,
    after: session,
    reason: input.reason ?? null,
  });

  return session;
};

export const rescheduleSession = async (
  id: string,
  input: RescheduleSessionInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const before = await prisma.classSession.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Session not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, before.classGroupId);

  if (input.startAt >= input.endAt) {
    throw badRequest("startAt must be before endAt");
  }

  const session = await prisma.classSession.update({
    where: { id },
    data: { startAt: input.startAt, endAt: input.endAt, status: "RESCHEDULED" },
  });

  await notifyEnrolledStudents(
    before.classGroupId,
    "Class rescheduled",
    `${session.title ?? "A class"} was moved to ${session.startAt.toISOString()}.${
      input.reason ? ` Reason: ${input.reason}` : ""
    }`,
    { sessionId: session.id, status: "RESCHEDULED", reason: input.reason ?? null },
  );

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_RESCHEDULED",
    entityType: "ClassSession",
    entityId: id,
    before,
    after: session,
    reason: input.reason ?? null,
  });

  return session;
};

export const addSessionMaterial = async (
  sessionId: string,
  input: CreateSessionMaterialInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true, classGroupId: true },
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
    select: { id: true, classGroupId: true },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  const enrollments = await prisma.enrollment.findMany({
    where: { classGroupId: session.classGroupId, status: "ACTIVE" },
    orderBy: { enrolledAt: "asc" },
    select: {
      student: {
        select: {
          id: true,
          studentCode: true,
          user: { select: { firstName: true, lastName: true, email: true, phone: true } },
          attendance: { where: { sessionId: id }, select: { status: true, note: true } },
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
    };
  });
};

const notifyLowAttendance = async (
  classGroupId: string,
  classGroupName: string,
  studentIds: string[],
  studentUserIds: Map<string, string>,
): Promise<void> => {
  if (studentIds.length === 0) {
    return;
  }

  const rows = await prisma.attendance.findMany({
    where: { studentId: { in: studentIds }, session: { classGroupId } },
    select: { studentId: true, status: true },
  });

  const counts = new Map<string, { total: number; attended: number }>();
  for (const row of rows) {
    const entry = counts.get(row.studentId) ?? { total: 0, attended: 0 };
    entry.total += 1;
    if (row.status === "PRESENT" || row.status === "LATE") {
      entry.attended += 1;
    }
    counts.set(row.studentId, entry);
  }

  const notifications: Prisma.NotificationCreateManyInput[] = [];
  for (const studentId of studentIds) {
    const entry = counts.get(studentId);
    const userId = studentUserIds.get(studentId);
    if (!entry || entry.total === 0 || !userId) {
      continue;
    }

    const percentage = Math.round((entry.attended / entry.total) * 10000) / 100;
    if (percentage >= env.ATTENDANCE_ALERT_THRESHOLD) {
      continue;
    }

    notifications.push({
      userId,
      type: "CLASS",
      channel: "IN_APP",
      title: "Low attendance",
      body: `Your attendance in ${classGroupName} is ${percentage}%, below the required ${env.ATTENDANCE_ALERT_THRESHOLD}%.`,
      data: { classGroupId, percentage },
    });
  }

  if (notifications.length > 0) {
    await prisma.notification.createMany({ data: notifications });
  }
};

export const markAttendance = async (
  sessionId: string,
  input: MarkAttendanceInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      classGroupId: true,
      title: true,
      classGroup: { select: { name: true } },
    },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, session.classGroupId);

  const enrollments = await prisma.enrollment.findMany({
    where: { classGroupId: session.classGroupId, status: "ACTIVE" },
    select: { student: { select: { id: true, userId: true } } },
  });
  const studentUserIds = new Map(
    enrollments.map((enrollment) => [enrollment.student.id, enrollment.student.userId]),
  );

  for (const record of input.records) {
    if (!studentUserIds.has(record.studentId)) {
      throw badRequest(`Student ${record.studentId} is not enrolled in this class group`);
    }
  }

  const now = new Date();
  await prisma.$transaction(
    input.records.map((record) =>
      prisma.attendance.upsert({
        where: { sessionId_studentId: { sessionId, studentId: record.studentId } },
        create: {
          sessionId,
          studentId: record.studentId,
          status: record.status,
          note: record.note ?? null,
          markedById: actorId ?? null,
          markedAt: now,
        },
        update: {
          status: record.status,
          note: record.note ?? null,
          markedById: actorId ?? null,
          markedAt: now,
        },
      }),
    ),
  );

  await writeAudit({
    actorId: actorId ?? null,
    action: "ATTENDANCE_MARKED",
    entityType: "ClassSession",
    entityId: sessionId,
    after: { records: input.records },
  });

  await notifyLowAttendance(
    session.classGroupId,
    session.classGroup.name,
    [...new Set(input.records.map((record) => record.studentId))],
    studentUserIds,
  );

  return { sessionId, marked: input.records.length };
};

export const updateAttendance = async (
  recordId: string,
  input: UpdateAttendanceInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const before = await prisma.attendance.findUnique({
    where: { id: recordId },
    include: { session: { select: { classGroupId: true } } },
  });
  if (!before) {
    throw notFound("Attendance record not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, before.session.classGroupId);

  const record = await prisma.attendance.update({
    where: { id: recordId },
    data: {
      status: input.status,
      note: input.note,
      markedById: actorId ?? before.markedById,
      markedAt: new Date(),
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ATTENDANCE_UPDATED",
    entityType: "Attendance",
    entityId: recordId,
    before,
    after: record,
  });

  return record;
};

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

  const sessionWhere: Prisma.ClassSessionWhereInput = {};
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

export const getMyAttendance = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });
  if (!student) {
    throw notFound("Student profile not found");
  }

  const history = await prisma.attendance.findMany({
    where: { studentId: student.id },
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
  const profile = await loadStudentAccessProfile(userId);
  if (profile.classGroupIds.length === 0) {
    return [];
  }

  return prisma.classSession.findMany({
    where: {
      classGroupId: { in: profile.classGroupIds },
      startAt: { gte: new Date() },
      status: { in: ["SCHEDULED", "LIVE", "RESCHEDULED"] },
    },
    orderBy: { startAt: "asc" },
    select: studentSessionSelect,
  });
};

export const getMySessions = async (userId: string, query: StudentSessionsQuery) => {
  const profile = await loadStudentAccessProfile(userId);
  const pagination = parsePagination(query);
  if (profile.classGroupIds.length === 0) {
    return buildPaginated([], 0, pagination);
  }

  const where: Prisma.ClassSessionWhereInput = {
    classGroupId: { in: profile.classGroupIds },
    startAt: { lt: new Date() },
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

  return buildPaginated(rows, total, pagination);
};

export const getMySession = async (userId: string, id: string) => {
  const profile = await loadStudentAccessProfile(userId);

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

  return session;
};
