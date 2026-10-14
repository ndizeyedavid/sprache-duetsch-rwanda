import type { Prisma } from "../../generated/prisma/client.js";

const levelRef = { select: { id: true, code: true, title: true, levelLabel: true } } as const;

/** Everything staff need to review one placement result. */
export const placementResultSelect = {
  id: true,
  studentId: true,
  source: true,
  attemptId: true,
  score: true,
  recommendedLevelId: true,
  chosenLevelId: true,
  assignedLevelId: true,
  overrideReason: true,
  decidedAt: true,
  note: true,
  createdAt: true,
  recommendedLevel: levelRef,
  chosenLevel: levelRef,
  assignedLevel: levelRef,
  decidedBy: { select: { id: true, firstName: true, lastName: true } },
} satisfies Prisma.PlacementResultSelect;

export type PlacementResultRow = Prisma.PlacementResultGetPayload<{ select: typeof placementResultSelect }>;

/** Students see their levels and score, never staff notes, reasons or who decided. */
export const toStudentPlacement = (row: PlacementResultRow) => ({
  id: row.id,
  source: row.source,
  score: row.score,
  createdAt: row.createdAt,
  decidedAt: row.decidedAt,
  recommendedLevel: row.recommendedLevel,
  chosenLevel: row.chosenLevel,
  assignedLevel: row.assignedLevel,
});
