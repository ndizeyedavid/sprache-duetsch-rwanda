import type { Prisma, Role } from "../../generated/prisma/client.js";
import {
  assertAccountActive,
  assertLevelAccess,
  assertPaymentAccess,
  loadStudentAccessProfile,
} from "../../lib/access.js";
import { writeAudit } from "../../lib/audit.js";
import { forbidden, notFound } from "../../lib/http-error.js";
import { buildPaginated, parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
  CreateActivityInput,
  CreateLessonInput,
  CreateMaterialInput,
  CreateModuleInput,
  MyNotesQuery,
  SearchQuery,
  UpdateActivityInput,
  UpdateLessonInput,
  UpdateMaterialInput,
  UpdateModuleInput,
  UpdateProgressInput,
} from "./content.schema.js";

export interface ContentActor {
  id?: string;
  role?: Role;
}

const NOTE_MATERIAL_TYPES = ["NOTE", "PDF", "WORKSHEET", "SLIDE"] as const;

const toJsonInput = (value: unknown): Prisma.InputJsonValue | undefined =>
  value === undefined || value === null ? undefined : value;

// Teachers may only manage content for levels where they teach a class group;
// academic admins are unrestricted.
const assertCanManageLevel = async (actor: ContentActor, levelId: string): Promise<void> => {
  if (actor.role !== "TEACHER") {
    return;
  }
  if (!actor.id) {
    throw forbidden("Authentication required");
  }
  const owned = await prisma.classGroup.count({ where: { teacherId: actor.id, levelId } });
  if (owned === 0) {
    throw forbidden("You can only manage content for levels you teach");
  }
};

const levelIdOfModule = async (moduleId: string): Promise<string> => {
  const found = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { levelId: true },
  });
  if (!found) {
    throw notFound("Module not found");
  }
  return found.levelId;
};

const levelIdOfLesson = async (lessonId: string): Promise<string> => {
  const found = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { module: { select: { levelId: true } } },
  });
  if (!found) {
    throw notFound("Lesson not found");
  }
  return found.module.levelId;
};

// ---------------------------------------------------------------------------
// Modules
// ---------------------------------------------------------------------------

export const createModule = async (
  levelId: string,
  input: CreateModuleInput,
  actor: ContentActor,
) => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw notFound("Level not found");
  }
  await assertCanManageLevel(actor, levelId);

  const created = await prisma.module.create({
    data: {
      levelId,
      title: input.title,
      description: input.description ?? null,
      order: input.order,
      isPublished: input.isPublished ?? false,
      releaseAt: input.releaseAt ?? null,
      prerequisiteModuleId: input.prerequisiteModuleId ?? null,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "MODULE_CREATED",
    entityType: "Module",
    entityId: created.id,
    after: created,
  });
  return created;
};

export const listModules = async (levelId: string) => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw notFound("Level not found");
  }
  return prisma.module.findMany({
    where: { levelId },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { lessons: true } },
      lessons: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          order: true,
          contentType: true,
          isPublished: true,
          estimatedMinutes: true,
        },
      },
    },
  });
};

export const updateModule = async (id: string, input: UpdateModuleInput, actor: ContentActor) => {
  const before = await prisma.module.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Module not found");
  }
  await assertCanManageLevel(actor, before.levelId);

  const updated = await prisma.module.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      order: input.order,
      isPublished: input.isPublished,
      releaseAt: input.releaseAt,
      prerequisiteModuleId: input.prerequisiteModuleId,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "MODULE_UPDATED",
    entityType: "Module",
    entityId: updated.id,
    before,
    after: updated,
  });
  return updated;
};

export const deleteModule = async (id: string, actor: ContentActor) => {
  const before = await prisma.module.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Module not found");
  }
  await assertCanManageLevel(actor, before.levelId);
  await prisma.module.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "MODULE_DELETED",
    entityType: "Module",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};

// ---------------------------------------------------------------------------
// Lessons
// ---------------------------------------------------------------------------

export const createLesson = async (
  moduleId: string,
  input: CreateLessonInput,
  actor: ContentActor,
) => {
  const levelId = await levelIdOfModule(moduleId);
  await assertCanManageLevel(actor, levelId);

  const created = await prisma.lesson.create({
    data: {
      moduleId,
      title: input.title,
      description: input.description ?? null,
      contentType: input.contentType,
      body: input.body ?? null,
      videoUrl: input.videoUrl ?? null,
      audioUrl: input.audioUrl ?? null,
      estimatedMinutes: input.estimatedMinutes,
      order: input.order,
      isPublished: input.isPublished ?? false,
      releaseAt: input.releaseAt ?? null,
      prerequisiteLessonId: input.prerequisiteLessonId ?? null,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "LESSON_CREATED",
    entityType: "Lesson",
    entityId: created.id,
    after: created,
  });
  return created;
};

export const getLesson = async (id: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          levelId: true,
          level: { select: { id: true, code: true, title: true, levelLabel: true } },
        },
      },
      materials: { orderBy: { createdAt: "asc" } },
      activities: { orderBy: { order: "asc" } },
    },
  });
  if (!lesson) {
    throw notFound("Lesson not found");
  }
  return lesson;
};

export const updateLesson = async (id: string, input: UpdateLessonInput, actor: ContentActor) => {
  const before = await prisma.lesson.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Lesson not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(id));

  const updated = await prisma.lesson.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      contentType: input.contentType,
      body: input.body,
      videoUrl: input.videoUrl,
      audioUrl: input.audioUrl,
      estimatedMinutes: input.estimatedMinutes,
      order: input.order,
      isPublished: input.isPublished,
      releaseAt: input.releaseAt,
      prerequisiteLessonId: input.prerequisiteLessonId,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "LESSON_UPDATED",
    entityType: "Lesson",
    entityId: updated.id,
    before,
    after: updated,
  });
  return updated;
};

export const deleteLesson = async (id: string, actor: ContentActor) => {
  const before = await prisma.lesson.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Lesson not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(id));
  await prisma.lesson.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "LESSON_DELETED",
    entityType: "Lesson",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};

// ---------------------------------------------------------------------------
// Lesson materials
// ---------------------------------------------------------------------------

export const createMaterial = async (
  lessonId: string,
  input: CreateMaterialInput,
  actor: ContentActor,
) => {
  await assertCanManageLevel(actor, await levelIdOfLesson(lessonId));

  const created = await prisma.lessonMaterial.create({
    data: {
      lessonId,
      title: input.title,
      type: input.type,
      url: input.url ?? null,
      mimeType: input.mimeType ?? null,
      sizeBytes: input.sizeBytes ?? null,
      isDownloadable: input.isDownloadable ?? true,
      uploadedById: actor.id ?? null,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "MATERIAL_CREATED",
    entityType: "LessonMaterial",
    entityId: created.id,
    after: created,
  });
  return created;
};

export const updateMaterial = async (
  id: string,
  input: UpdateMaterialInput,
  actor: ContentActor,
) => {
  const before = await prisma.lessonMaterial.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Material not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));

  const updated = await prisma.lessonMaterial.update({
    where: { id },
    data: {
      title: input.title,
      type: input.type,
      url: input.url,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      isDownloadable: input.isDownloadable,
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "MATERIAL_UPDATED",
    entityType: "LessonMaterial",
    entityId: updated.id,
    before,
    after: updated,
  });
  return updated;
};

export const deleteMaterial = async (id: string, actor: ContentActor) => {
  const before = await prisma.lessonMaterial.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Material not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));
  await prisma.lessonMaterial.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "MATERIAL_DELETED",
    entityType: "LessonMaterial",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};

// ---------------------------------------------------------------------------
// Lesson activities
// ---------------------------------------------------------------------------

export const createActivity = async (
  lessonId: string,
  input: CreateActivityInput,
  actor: ContentActor,
) => {
  await assertCanManageLevel(actor, await levelIdOfLesson(lessonId));

  const created = await prisma.activity.create({
    data: {
      lessonId,
      title: input.title,
      type: input.type,
      instructions: input.instructions ?? null,
      order: input.order ?? 0,
      isPublished: input.isPublished ?? false,
      config: toJsonInput(input.config),
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "ACTIVITY_CREATED",
    entityType: "Activity",
    entityId: created.id,
    after: created,
  });
  return created;
};

export const updateActivity = async (
  id: string,
  input: UpdateActivityInput,
  actor: ContentActor,
) => {
  const before = await prisma.activity.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Activity not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));

  const updated = await prisma.activity.update({
    where: { id },
    data: {
      title: input.title,
      type: input.type,
      instructions: input.instructions,
      order: input.order,
      isPublished: input.isPublished,
      config: toJsonInput(input.config),
    },
  });

  await writeAudit({
    actorId: actor.id ?? null,
    action: "ACTIVITY_UPDATED",
    entityType: "Activity",
    entityId: updated.id,
    before,
    after: updated,
  });
  return updated;
};

export const deleteActivity = async (id: string, actor: ContentActor) => {
  const before = await prisma.activity.findUnique({ where: { id } });
  if (!before) {
    throw notFound("Activity not found");
  }
  await assertCanManageLevel(actor, await levelIdOfLesson(before.lessonId));
  await prisma.activity.delete({ where: { id } });
  await writeAudit({
    actorId: actor.id ?? null,
    action: "ACTIVITY_DELETED",
    entityType: "Activity",
    entityId: before.id,
    before,
  });
  return { id: before.id };
};

// ---------------------------------------------------------------------------
// Student learning views
// ---------------------------------------------------------------------------

const releasedFilter = (now: Date) => ({
  isPublished: true,
  OR: [{ releaseAt: null }, { releaseAt: { lte: now } }],
});

export const getStudentCourses = async (userId: string) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);

  const enrollments = await prisma.enrollment.findMany({
    where: { studentId: profile.studentId, status: "ACTIVE" },
    select: { levelId: true },
    distinct: ["levelId"],
  });
  const levelIds = enrollments.map((enrollment) => enrollment.levelId);
  if (levelIds.length === 0) {
    return [];
  }

  const now = new Date();
  const release = releasedFilter(now);
  const levels = await prisma.level.findMany({
    where: { id: { in: levelIds } },
    orderBy: { order: "asc" },
    select: {
      id: true,
      code: true,
      title: true,
      levelLabel: true,
      summary: true,
      order: true,
      modules: {
        where: release,
        orderBy: { order: "asc" },
        select: {
          id: true,
          title: true,
          description: true,
          order: true,
          lessons: {
            where: release,
            orderBy: { order: "asc" },
            select: {
              id: true,
              title: true,
              description: true,
              order: true,
              contentType: true,
              estimatedMinutes: true,
              progress: {
                where: { studentId: profile.studentId },
                select: { status: true, secondsWatched: true, completedAt: true },
              },
            },
          },
        },
      },
    },
  });

  return levels.map((level) => {
    const allLessons = level.modules.flatMap((item) => item.lessons);
    const completedCount = allLessons.filter(
      (lesson) => lesson.progress[0]?.status === "COMPLETED",
    ).length;

    const modules = level.modules.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      order: item.order,
      lessons: item.lessons.map((lesson) => {
        const progress = lesson.progress[0] ?? null;
        return {
          id: lesson.id,
          title: lesson.title,
          description: lesson.description,
          order: lesson.order,
          contentType: lesson.contentType,
          estimatedMinutes: lesson.estimatedMinutes,
          progressStatus: progress?.status ?? "NOT_STARTED",
          secondsWatched: progress?.secondsWatched ?? 0,
          completedAt: progress?.completedAt ?? null,
        };
      }),
    }));

    return {
      level: {
        id: level.id,
        code: level.code,
        title: level.title,
        levelLabel: level.levelLabel,
        summary: level.summary,
        order: level.order,
      },
      modules,
      stats: {
        totalLessons: allLessons.length,
        completedLessons: completedCount,
        completionPercentage:
          allLessons.length === 0 ? 0 : Math.round((completedCount / allLessons.length) * 100),
      },
    };
  });
};

export const getStudentLesson = async (userId: string, lessonId: string) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        select: {
          id: true,
          title: true,
          levelId: true,
          level: { select: { id: true, code: true, title: true, levelLabel: true } },
        },
      },
      materials: { orderBy: { createdAt: "asc" } },
      activities: { where: { isPublished: true }, orderBy: { order: "asc" } },
    },
  });

  const now = new Date();
  if (!lesson || !lesson.isPublished || (lesson.releaseAt && lesson.releaseAt > now)) {
    throw notFound("Lesson not found");
  }

  await assertLevelAccess(userId, lesson.module.levelId);
  const profile = await loadStudentAccessProfile(userId);
  assertPaymentAccess(profile, "LESSON");

  const progress = await prisma.lessonProgress.findUnique({
    where: { studentId_lessonId: { studentId: profile.studentId, lessonId } },
    select: { status: true, secondsWatched: true, completedAt: true },
  });

  let lockedByPrerequisite = false;
  if (lesson.prerequisiteLessonId) {
    const prerequisite = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: profile.studentId,
          lessonId: lesson.prerequisiteLessonId,
        },
      },
      select: { status: true },
    });
    lockedByPrerequisite = prerequisite?.status !== "COMPLETED";
    if (lockedByPrerequisite) {
      throw forbidden("Complete the prerequisite lesson first");
    }
  }

  return {
    ...lesson,
    progressStatus: progress?.status ?? "NOT_STARTED",
    secondsWatched: progress?.secondsWatched ?? 0,
    completedAt: progress?.completedAt ?? null,
    lockedByPrerequisite,
  };
};

export const upsertLessonProgress = async (
  userId: string,
  lessonId: string,
  input: UpdateProgressInput,
) => {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { prerequisiteLessonId: true, module: { select: { levelId: true } } },
  });
  if (!lesson) {
    throw notFound("Lesson not found");
  }
  await assertLevelAccess(userId, lesson.module.levelId);
  const profile = await loadStudentAccessProfile(userId);

  if (input.status === "COMPLETED" && lesson.prerequisiteLessonId) {
    const prerequisite = await prisma.lessonProgress.findUnique({
      where: {
        studentId_lessonId: {
          studentId: profile.studentId,
          lessonId: lesson.prerequisiteLessonId,
        },
      },
      select: { status: true },
    });
    if (prerequisite?.status !== "COMPLETED") {
      throw forbidden("Complete the prerequisite lesson first");
    }
  }

  const completedAt = input.status === "COMPLETED" ? new Date() : null;

  return prisma.lessonProgress.upsert({
    where: { studentId_lessonId: { studentId: profile.studentId, lessonId } },
    create: {
      studentId: profile.studentId,
      lessonId,
      status: input.status,
      secondsWatched: input.secondsWatched ?? 0,
      completedAt,
    },
    update: {
      status: input.status,
      secondsWatched: input.secondsWatched,
      completedAt,
    },
  });
};

export const getStudentNotes = async (userId: string, query: MyNotesQuery) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  assertPaymentAccess(profile, "LESSON");

  const pagination = parsePagination(query);
  const now = new Date();
  const types = query.type ? [query.type] : [...NOTE_MATERIAL_TYPES];

  const where: Prisma.LessonMaterialWhereInput = {
    type: { in: types },
    lesson: {
      isPublished: true,
      OR: [{ releaseAt: null }, { releaseAt: { lte: now } }],
      module: { isPublished: true, levelId: { in: profile.levelIds } },
    },
  };
  if (query.search) {
    where.title = { contains: query.search, mode: "insensitive" };
  }

  const [rows, total] = await prisma.$transaction([
    prisma.lessonMaterial.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: pagination.skip,
      take: pagination.take,
      include: {
        lesson: {
          select: {
            id: true,
            title: true,
            module: { select: { id: true, title: true, levelId: true } },
          },
        },
      },
    }),
    prisma.lessonMaterial.count({ where }),
  ]);

  return buildPaginated(rows, total, pagination);
};

// ---------------------------------------------------------------------------
// Cross-entity search
// ---------------------------------------------------------------------------

type LevelFilter = { in: string[] } | { equals: string };

interface SearchItem {
  id: string;
  type: "MODULE" | "LESSON" | "MATERIAL";
  title: string;
  snippet: string | null;
  levelId: string;
  moduleId: string | null;
  lessonId: string | null;
  createdAt: Date;
}

export interface SearchViewer {
  id: string;
  role: Role;
}

export const searchContent = async (query: SearchQuery, viewer: SearchViewer) => {
  const pagination = parsePagination(query);
  const now = new Date();
  const isStudent = viewer.role === "STUDENT";

  let levelFilter: LevelFilter | undefined;
  if (isStudent) {
    const profile = await loadStudentAccessProfile(viewer.id);
    assertAccountActive(profile);
    if (query.levelId) {
      levelFilter = { in: profile.levelIds.includes(query.levelId) ? [query.levelId] : [] };
    } else {
      levelFilter = { in: profile.levelIds };
    }
  } else if (query.levelId) {
    levelFilter = { equals: query.levelId };
  }

  const types = query.type ? [query.type] : (["MODULE", "LESSON", "MATERIAL"] as const);
  const take = pagination.skip + pagination.take;
  const contains = { contains: query.q, mode: "insensitive" as const };
  const items: SearchItem[] = [];
  let total = 0;

  if (types.includes("MODULE")) {
    const AND: Prisma.ModuleWhereInput[] = [
      { OR: [{ title: contains }, { description: contains }] },
    ];
    if (isStudent) {
      AND.push({ isPublished: true }, { OR: [{ releaseAt: null }, { releaseAt: { lte: now } }] });
    }
    const where: Prisma.ModuleWhereInput = {
      AND,
      ...(levelFilter ? { levelId: levelFilter } : {}),
    };
    const [rows, count] = await prisma.$transaction([
      prisma.module.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          levelId: true,
          updatedAt: true,
        },
        orderBy: { updatedAt: "desc" },
        take,
      }),
      prisma.module.count({ where }),
    ]);
    total += count;
    for (const row of rows) {
      items.push({
        id: row.id,
        type: "MODULE",
        title: row.title,
        snippet: row.description,
        levelId: row.levelId,
        moduleId: row.id,
        lessonId: null,
        createdAt: row.updatedAt,
      });
    }
  }

  if (types.includes("LESSON")) {
    const moduleWhere: Prisma.ModuleWhereInput = {};
    if (levelFilter) moduleWhere.levelId = levelFilter;
    if (isStudent) moduleWhere.isPublished = true;
    const AND: Prisma.LessonWhereInput[] = [
      {
        OR: [{ title: contains }, { description: contains }, { body: contains }],
      },
      { module: moduleWhere },
    ];
    if (isStudent) {
      AND.push({ isPublished: true }, { OR: [{ releaseAt: null }, { releaseAt: { lte: now } }] });
    }
    const where: Prisma.LessonWhereInput = { AND };
    const [rows, count] = await prisma.$transaction([
      prisma.lesson.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          moduleId: true,
          updatedAt: true,
          module: { select: { levelId: true } },
        },
        orderBy: { updatedAt: "desc" },
        take,
      }),
      prisma.lesson.count({ where }),
    ]);
    total += count;
    for (const row of rows) {
      items.push({
        id: row.id,
        type: "LESSON",
        title: row.title,
        snippet: row.description,
        levelId: row.module.levelId,
        moduleId: row.moduleId,
        lessonId: row.id,
        createdAt: row.updatedAt,
      });
    }
  }

  if (types.includes("MATERIAL")) {
    const moduleWhere: Prisma.ModuleWhereInput = {};
    if (levelFilter) moduleWhere.levelId = levelFilter;
    if (isStudent) moduleWhere.isPublished = true;
    const lessonWhere: Prisma.LessonWhereInput = { module: moduleWhere };
    if (isStudent) {
      lessonWhere.isPublished = true;
      lessonWhere.OR = [{ releaseAt: null }, { releaseAt: { lte: now } }];
    }
    const where: Prisma.LessonMaterialWhereInput = { title: contains, lesson: lessonWhere };
    const [rows, count] = await prisma.$transaction([
      prisma.lessonMaterial.findMany({
        where,
        select: {
          id: true,
          title: true,
          createdAt: true,
          lesson: {
            select: {
              id: true,
              module: { select: { id: true, levelId: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
      }),
      prisma.lessonMaterial.count({ where }),
    ]);
    total += count;
    for (const row of rows) {
      items.push({
        id: row.id,
        type: "MATERIAL",
        title: row.title,
        snippet: null,
        levelId: row.lesson.module.levelId,
        moduleId: row.lesson.module.id,
        lessonId: row.lesson.id,
        createdAt: row.createdAt,
      });
    }
  }

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  const pageRows = items.slice(pagination.skip, pagination.skip + pagination.take);

  return buildPaginated(pageRows, total, pagination);
};
