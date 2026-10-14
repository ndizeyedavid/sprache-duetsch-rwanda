export interface PlacementLevelCandidate {
  id: string;
  order: number;
  isActive: boolean;
  /** Lowest placement percentage that recommends this level; null = never recommended. */
  placementMinScore: number | null;
}

const byOrder = (a: PlacementLevelCandidate, b: PlacementLevelCandidate) =>
  a.order - b.order || (a.placementMinScore ?? 0) - (b.placementMinScore ?? 0);

/**
 * Recommend a level for a placement percentage (0-100).
 * Picks the highest (by curriculum order) ACTIVE level whose placementMinScore is at or
 * below the score. Levels without a placementMinScore (specialised tracks) are never
 * recommended. When no band matches, falls back to the lowest active placement level,
 * then to the lowest active level. Returns null only when no level is active.
 */
export const pickPlacementLevel = <T extends PlacementLevelCandidate>(levels: T[], score: number): T | null => {
  const active = levels.filter((level) => level.isActive).sort(byOrder);
  if (active.length === 0) return null;
  const banded = active.filter((level) => level.placementMinScore !== null);
  const eligible = banded.filter((level) => (level.placementMinScore ?? Infinity) <= score);
  if (eligible.length > 0) return eligible[eligible.length - 1];
  return banded[0] ?? active[0];
};
