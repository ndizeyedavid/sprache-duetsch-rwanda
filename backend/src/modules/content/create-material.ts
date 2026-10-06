import { writeAudit } from "../../lib/audit.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
CreateMaterialInput
} from "./content.schema.js";
import { levelIdOfLesson } from './level-id-of-lesson.js';
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
