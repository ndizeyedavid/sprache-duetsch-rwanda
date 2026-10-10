import { writeAudit } from "../../lib/audit.js";
import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { getLevelOrThrow } from './get-level-or-throw.js';
import { recommendLevelByScore } from './recommend-level-by-score.js';
import type { PlacementInput } from "./students.schema.js";
export const runPlacement = async (id: string, input: PlacementInput, actorId?: string) => {
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, placementScore: true, intendedLevelId: true },
  });

  if (!student) {
    throw notFound("Student not found");
  }

  const recommendedLevel = input.recommendedLevelId
    ? await getLevelOrThrow(input.recommendedLevelId)
    : await recommendLevelByScore(input.score);

  await prisma.student.update({
    where: { id },
    data: { placementScore: input.score, intendedLevelId: recommendedLevel.id },
  });

  await writeAudit({
    actorId: actorId ?? null,
    action: "STUDENT_PLACEMENT_COMPLETED",
    entityType: "Student",
    entityId: id,
    before: { placementScore: student.placementScore, intendedLevelId: student.intendedLevelId },
    after: {
      placementScore: input.score,
      intendedLevelId: recommendedLevel.id,
      note: input.note ?? null,
    },
  });

  return { score: input.score, recommendedLevel };
};
