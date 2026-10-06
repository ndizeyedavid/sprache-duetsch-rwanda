import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const recommendLevelByScore = async (score: number) => {
  const levels = await prisma.level.findMany({ orderBy: { order: "asc" } });
  if (levels.length === 0) {
    throw badRequest("No levels are configured");
  }
  const index = Math.min(Math.max(Math.floor(score / 25), 0), levels.length - 1);
  return levels[index];
};
