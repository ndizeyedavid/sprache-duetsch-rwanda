import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertCanManageLevel } from './assert-can-manage-level.js';
import type { ContentActor } from './content-actor.js';
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
