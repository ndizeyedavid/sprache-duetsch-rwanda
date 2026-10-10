import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const assertLevelExists = async (levelId: string): Promise<void> => {
  const level = await prisma.level.findUnique({ where: { id: levelId }, select: { id: true } });
  if (!level) {
    throw badRequest("Level not found");
  }
};
