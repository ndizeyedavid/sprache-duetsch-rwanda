import { prisma } from "../src/lib/prisma.js";

/** Default placement bands (lowest test % per level). Specialised levels stay null. */
const DEFAULT_BANDS: Record<string, number> = { A1: 0, A2: 30, B1: 55, B2: 80 };

/** Fills in missing bands only, so thresholds edited by admins survive a re-seed. */
export const applyPlacementBands = async () => {
  for (const [code, placementMinScore] of Object.entries(DEFAULT_BANDS)) {
    await prisma.level.updateMany({ where: { code, placementMinScore: null }, data: { placementMinScore } });
  }
};
