import type { Role } from "../../generated/prisma/client.js";
import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { assertTeacherIfNeeded } from './assert-teacher-if-needed.js';
import type {
CreateSessionMaterialInput
} from "./sessions.schema.js";
export const addSessionMaterial = async (
  sessionId: string,
  input: CreateSessionMaterialInput,
  actorId?: string,
  actorRole?: Role,
) => {
  const session = await prisma.classSession.findUnique({
    where: { id: sessionId },
    select: { id: true, classGroupId: true, endAt: true },
  });
  if (!session) {
    throw notFound("Session not found");
  }

  await assertTeacherIfNeeded(actorId, actorRole, session.classGroupId);

  const material = await prisma.sessionMaterial.create({
    data: {
      sessionId,
      title: input.title,
      type: input.type,
      url: input.url ?? null,
      description: input.description ?? null,
      uploadedById: actorId ?? null,
    },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "SESSION_MATERIAL_CREATED",
    entityType: "SessionMaterial",
    entityId: material.id,
    after: material,
  });

  return material;
};
