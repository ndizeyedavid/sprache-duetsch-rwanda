import { writeAuditTx } from "../../lib/audit.js";
import { badRequest,notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getLevelOrThrow } from "./get-level-or-throw.js";
import { notifyPlacementStudent } from "./notify-placement-student.js";
import { checkPlacementDecision } from "./placement-decision.js";
import { placementResultSelect } from "./placement-view.js";
import type { ManualPlacementInput } from "./placement.schema.js";
import { recommendLevelByScore } from "./recommend-level-by-score.js";

/**
 * Staff-entered placement (e.g. a paper test or interview). Stored as a MANUAL
 * PlacementResult using the same bands as the online test; optionally decided at once.
 */
export const runPlacement = async (id: string, input: ManualPlacementInput, actorId?: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, placementScore: true, intendedLevelId: true },
  });
  if (!student) throw notFound("Student not found");

  const recommended = await recommendLevelByScore(input.score);
  let decision: { assignedLevelId: string; overrideReason: string | null; isOverride: boolean; code: string; title: string } | null = null;
  if (input.assignedLevelId) {
    const level = await getLevelOrThrow(input.assignedLevelId);
    if (!level.isActive) throw badRequest("Choose an active level");
    const check = checkPlacementDecision({
      recommendedLevelId: recommended.id,
      assignedLevelId: level.id,
      overrideReason: input.overrideReason,
    });
    if (!check.ok) throw badRequest(check.message);
    decision = { assignedLevelId: level.id, overrideReason: check.overrideReason, isOverride: check.isOverride, code: level.code, title: level.title };
  }

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.placementResult.create({
      data: {
        studentId: id,
        source: "MANUAL",
        score: input.score,
        recommendedLevelId: recommended.id,
        chosenLevelId: student.intendedLevelId,
        note: input.note ?? null,
        ...(decision
          ? { assignedLevelId: decision.assignedLevelId, overrideReason: decision.overrideReason, decidedById: actorId ?? null, decidedAt: new Date() }
          : {}),
      },
      select: placementResultSelect,
    });
    await tx.student.update({ where: { id }, data: { placementScore: input.score } });
    await writeAuditTx(tx, {
      actorId: actorId ?? null,
      action: "PLACEMENT_RECORDED",
      entityType: "PlacementResult",
      entityId: created.id,
      before: { placementScore: student.placementScore },
      after: {
        studentId: id,
        score: input.score,
        recommendedLevelId: recommended.id,
        assignedLevelId: decision?.assignedLevelId ?? null,
        note: input.note ?? null,
      },
      reason: decision?.overrideReason ?? null,
    });
    return created;
  });

  if (decision) {
    await notifyPlacementStudent({ resultId: result.id, studentId: id, levelCode: decision.code, levelTitle: decision.title });
  }
  return result;
};
