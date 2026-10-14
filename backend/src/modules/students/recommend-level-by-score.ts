import type { Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
import { pickPlacementLevel } from "./pick-placement-level.js";

type Client = Prisma.TransactionClient | typeof prisma;

/** Loads the level catalogue and applies the placement bands (see pickPlacementLevel). */
export const recommendLevelByScore = async (score: number, client: Client = prisma) => {
  const levels = await client.level.findMany({
    select: { id: true, code: true, title: true, levelLabel: true, order: true, isActive: true, placementMinScore: true },
  });
  const level = pickPlacementLevel(levels, score);
  if (!level) {
    throw badRequest("No active levels are configured");
  }
  return level;
};
