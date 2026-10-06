import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const assertCampusExists = async (campusId: string): Promise<void> => {
  const campus = await prisma.campus.findUnique({ where: { id: campusId }, select: { id: true } });
  if (!campus) {
    throw badRequest("Campus not found");
  }
};
