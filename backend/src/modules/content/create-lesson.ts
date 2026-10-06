import { Prisma } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
CreateLessonInput
} from "./content.schema.js";
import { levelIdOfModule } from './level-id-of-module.js';
export const createLesson = async (
  moduleId: string,
  input: CreateLessonInput,
  actor: ContentActor,
) => {
  const levelId = await levelIdOfModule(moduleId);
  await assertCanManageLevel(actor, levelId);

  let order = input.order;
  if (order === undefined) {
    const last = await prisma.lesson.findFirst({ where: { moduleId }, orderBy: { order: "desc" }, select: { order: true } });
    order = last ? last.order + 1 : 0;
  }

  let created: Awaited<ReturnType<typeof prisma.lesson.create>>;
  try {
    created = await prisma.lesson.create({
      data: {
        moduleId,
        title: input.title,
        description: input.description ?? null,
        contentType: input.contentType,
        body: input.body ?? null,
        videoUrl: input.videoUrl ?? null,
        audioUrl: input.audioUrl ?? null,
        estimatedMinutes: input.estimatedMinutes,
        order: order,
        isPublished: input.isPublished ?? false,
        releaseAt: input.releaseAt ?? null,
        prerequisiteLessonId: input.prerequisiteLessonId ?? null,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const last = await prisma.lesson.findFirst({ where: { moduleId }, orderBy: { order: "desc" }, select: { order: true } });
      const nextOrder = last ? last.order + 1 : 0;
      created = await prisma.lesson.create({
        data: {
          moduleId,
          title: input.title,
          description: input.description ?? null,
          contentType: input.contentType,
          body: input.body ?? null,
          videoUrl: input.videoUrl ?? null,
          audioUrl: input.audioUrl ?? null,
          estimatedMinutes: input.estimatedMinutes,
          order: nextOrder,
          isPublished: input.isPublished ?? false,
          releaseAt: input.releaseAt ?? null,
          prerequisiteLessonId: input.prerequisiteLessonId ?? null,
        },
      });
    } else throw e;
  }

  await writeAudit({
    actorId: actor.id ?? null,
    action: "LESSON_CREATED",
    entityType: "Lesson",
    entityId: created.id,
    after: created,
  });
  return created;
};
