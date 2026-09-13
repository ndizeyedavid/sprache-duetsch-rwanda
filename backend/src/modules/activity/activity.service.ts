import type { ActivityEventType, Prisma, Role } from "../../generated/prisma/client.js";
import { notFound } from "../../lib/http-error.js";
import { logger } from "../../lib/logger.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { writeAudit } from "../../lib/audit.js";
import type { CreateEventInput, ListFeedQuery } from "./activity.schema.js";

export interface EmitActivityInput {
  actorId?: string | null;
  actorName?: string | null;
  type: ActivityEventType;
  title: string;
  body?: string | null;
  levelId?: string | null;
  classGroupId?: string | null;
  studentId?: string | null;
  userId?: string | null;
}

/**
 * Best-effort fan-out for domain events. Never throws: feed writes must not
 * break the academic/finance flow that triggered them.
 */
export const emitActivity = async (input: EmitActivityInput): Promise<void> => {
  try {
    let actorName = input.actorName ?? null;
    if (!actorName && input.actorId) {
      const actor = await prisma.user.findUnique({
        where: { id: input.actorId },
        select: { firstName: true, lastName: true },
      });
      if (actor) {
        actorName = `${actor.firstName} ${actor.lastName}`.trim();
      }
    }

    await prisma.activityEvent.create({
      data: {
        type: input.type,
        title: input.title,
        body: input.body ?? null,
        actorId: input.actorId ?? null,
        actorName,
        levelId: input.levelId ?? null,
        classGroupId: input.classGroupId ?? null,
        studentId: input.studentId ?? null,
        userId: input.userId ?? null,
      },
    });
  } catch (error) {
    logger.warn({ err: error }, "Failed to emit activity event");
  }
};

/** Class/level scope of a student, used to filter the feed. */
const studentScope = async (userId: string) => {
  const student = await prisma.student.findUnique({
    where: { userId },
    select: {
      id: true,
      currentLevelId: true,
      intendedLevelId: true,
      enrollments: {
        where: { status: "ACTIVE" },
        select: { levelId: true, classGroupId: true },
      },
    },
  });
  if (!student) {
    return { studentId: null as string | null, classGroupIds: [] as string[], levelIds: [] as string[] };
  }
  const classGroupIds = student.enrollments
    .map((enrollment) => enrollment.classGroupId)
    .filter((id): id is string => id !== null);
  const levelIds = [
    ...new Set([
      ...student.enrollments.map((enrollment) => enrollment.levelId),
      ...(student.currentLevelId ? [student.currentLevelId] : []),
      ...(student.intendedLevelId ? [student.intendedLevelId] : []),
    ]),
  ];
  return { studentId: student.id, classGroupIds, levelIds };
};

export const getFeed = async (userId: string, role: Role, query: ListFeedQuery) => {
  const pagination = parsePagination(query, { defaultPageSize: 30 });

  const where: Prisma.ActivityEventWhereInput = {};
  if (query.type) where.type = query.type;
  if (query.levelId) where.levelId = query.levelId;
  if (query.classGroupId) where.classGroupId = query.classGroupId;

  if (role === "STUDENT") {
    const scope = await studentScope(userId);
    where.AND = [
      {
        OR: [
          // Global posts (no scope at all).
          {
            levelId: null,
            classGroupId: null,
            studentId: null,
            userId: null,
          },
          // Directly targeted at me.
          { userId },
          ...(scope.studentId ? [{ studentId: scope.studentId }] : []),
          ...(scope.classGroupIds.length > 0 ? [{ classGroupId: { in: scope.classGroupIds } }] : []),
          ...(scope.levelIds.length > 0 ? [{ levelId: { in: scope.levelIds } }] : []),
        ],
      },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    prisma.activityEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
    }),
    prisma.activityEvent.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

export const createEvent = async (actorId: string | undefined, input: CreateEventInput) => {
  const event = await prisma.activityEvent.create({
    data: {
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      actorId: actorId ?? null,
      levelId: input.levelId ?? null,
      classGroupId: input.classGroupId ?? null,
      studentId: input.studentId ?? null,
      userId: input.userId ?? null,
    },
  });

  if (actorId) {
    const actor = await prisma.user.findUnique({
      where: { id: actorId },
      select: { firstName: true, lastName: true },
    });
    if (actor) {
      await prisma.activityEvent.update({
        where: { id: event.id },
        data: { actorName: `${actor.firstName} ${actor.lastName}`.trim() },
      });
    }
  }

  await writeAudit({
    actorId: actorId ?? null,
    action: "ACTIVITY_EVENT_CREATED",
    entityType: "ActivityEvent",
    entityId: event.id,
    after: event,
  });

  return event;
};

export const deleteEvent = async (id: string, actorId: string | undefined) => {
  const existing = await prisma.activityEvent.findUnique({ where: { id } });
  if (!existing) {
    throw notFound("Activity event not found");
  }
  await prisma.activityEvent.delete({ where: { id } });

  await writeAudit({
    actorId: actorId ?? null,
    action: "ACTIVITY_EVENT_DELETED",
    entityType: "ActivityEvent",
    entityId: id,
    before: existing,
  });

  return { message: "Activity event deleted" };
};
