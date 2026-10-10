import type { Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertTeacherIfNeeded } from './assert-teacher-if-needed.js';
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
