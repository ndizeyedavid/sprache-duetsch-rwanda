import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
import type {
UpdateMaterialInput
} from "./content.schema.js";
import { levelIdOfLesson } from './level-id-of-lesson.js';
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
