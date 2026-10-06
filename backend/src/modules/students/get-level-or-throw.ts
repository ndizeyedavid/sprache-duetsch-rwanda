import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const getLevelOrThrow = async (levelId: string) => {
  const level = await prisma.level.findUnique({ where: { id: levelId } });
  if (!level) {
    throw badRequest("Level not found");
  }
  return level;
};
