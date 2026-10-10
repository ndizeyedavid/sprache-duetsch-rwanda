import type { Prisma } from "../../generated/prisma/client.js";
import {
assertAccountActive,
loadStudentAccessProfile
} from "../../lib/access.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
SearchQuery
} from "./content.schema.js";
import type { LevelFilter } from './level-filter.js';
import type { SearchItem } from './search-item.js';
import type { SearchViewer } from './search-viewer.js';
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
