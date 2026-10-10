import type { Prisma } from "../../generated/prisma/client.js";
import {
assertAccountActive,
assertPaymentAccess,
loadStudentAccessProfile
} from "../../lib/access.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import type {
MyNotesQuery
} from "./content.schema.js";
import { getAvailableLessonIds } from "./lesson-availability.js";
import { NOTE_MATERIAL_TYPES } from './note_material_types.js';
export const getStudentNotes = async (userId: string, query: MyNotesQuery) => {
  const profile = await loadStudentAccessProfile(userId);
  assertAccountActive(profile);
  assertPaymentAccess(profile, "LESSON");

  const pagination = parsePagination(query);
  const now = new Date();
  const types = query.type ? [query.type] : [...NOTE_MATERIAL_TYPES];

  const where: Prisma.LessonMaterialWhereInput = {
    lessonId: { in: await getAvailableLessonIds(userId) },
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
