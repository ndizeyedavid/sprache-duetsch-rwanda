import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
UpdateLessonInput
} from "./content.schema.js";
import { levelIdOfLesson } from './level-id-of-lesson.js';
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
