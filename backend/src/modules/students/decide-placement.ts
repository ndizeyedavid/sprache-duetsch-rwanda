import { writeAudit } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getLevelOrThrow } from "./get-level-or-throw.js";
import { notifyPlacementStudent } from "./notify-placement-student.js";
import { checkPlacementDecision } from "./placement-decision.js";
import { placementResultSelect } from "./placement-view.js";
import type { PlacementDecisionInput } from "./placement.schema.js";

/**
 * Confirm or override a placement result. Sets the assigned level that enrolment
 * staff use; it never enrols the student or touches their own level choice.
 */
export const decidePlacement = async (
  studentId: string,
  resultId: string,
  input: PlacementDecisionInput,
  actorId?: string,
) => {
  const before = await prisma.placementResult.findUnique({ where: { id: resultId }, select: placementResultSelect });
  if (!before || before.studentId !== studentId) throw notFound("Placement result not found");
  const level = await getLevelOrThrow(input.assignedLevelId);
  if (!level.isActive) throw badRequest("Choose an active level");

  const check = checkPlacementDecision({
    recommendedLevelId: before.recommendedLevelId,
    assignedLevelId: level.id,
    overrideReason: input.overrideReason,
  });
  if (!check.ok) throw badRequest(check.message);

  const updated = await prisma.placementResult.update({
    where: { id: resultId },
    data: {
      assignedLevelId: level.id,
      overrideReason: check.overrideReason,
      decidedById: actorId ?? null,
      decidedAt: new Date(),
    },
    select: placementResultSelect,
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: check.isOverride ? "PLACEMENT_OVERRIDDEN" : "PLACEMENT_CONFIRMED",
    entityType: "PlacementResult",
    entityId: resultId,
    before: { assignedLevelId: before.assignedLevelId, overrideReason: before.overrideReason, decidedAt: before.decidedAt },
    after: { assignedLevelId: updated.assignedLevelId, overrideReason: updated.overrideReason, decidedAt: updated.decidedAt },
    reason: check.overrideReason,
  });

  if (before.assignedLevelId !== level.id) {
    await notifyPlacementStudent({ resultId, studentId, levelCode: level.code, levelTitle: level.title });
  }
  return updated;
};
