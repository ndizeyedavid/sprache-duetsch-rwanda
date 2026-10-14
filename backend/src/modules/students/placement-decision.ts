export type PlacementDecisionCheck =
  | { ok: true; isOverride: boolean; overrideReason: string | null }
  | { ok: false; message: string };

/**
 * A staff decision either confirms the recommended level or overrides it.
 * Overrides must carry a reason; confirmations never store one.
 */
export const checkPlacementDecision = (input: {
  recommendedLevelId: string;
  assignedLevelId: string;
  overrideReason?: string | null;
}): PlacementDecisionCheck => {
  const reason = input.overrideReason?.trim() || null;
  const isOverride = input.assignedLevelId !== input.recommendedLevelId;
  if (isOverride && !reason) {
    return { ok: false, message: "Give a reason when the assigned level differs from the recommended level" };
  }
  return { ok: true, isOverride, overrideReason: isOverride ? reason : null };
};

export type PlacementStatus = "UNAVAILABLE" | "NOT_TAKEN" | "IN_PROGRESS" | "AWAITING_DECISION" | "CONFIRMED";

/** Student-facing status: an open attempt wins, then the latest result, then test availability. */
export const placementStatus = (input: {
  hasTest: boolean;
  hasActiveAttempt: boolean;
  latest: { assignedLevelId: string | null } | null;
}): PlacementStatus => {
  if (input.hasActiveAttempt) return "IN_PROGRESS";
  if (input.latest) return input.latest.assignedLevelId ? "CONFIRMED" : "AWAITING_DECISION";
  return input.hasTest ? "NOT_TAKEN" : "UNAVAILABLE";
};
