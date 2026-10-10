import { notFound } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const levelIdOfModule = async (moduleId: string): Promise<string> => {
  const found = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { levelId: true },
  });
  if (!found) {
    throw notFound("Module not found");
  }
  return found.levelId;
};
