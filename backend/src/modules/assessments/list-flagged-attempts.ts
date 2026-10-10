import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
export const listFlaggedAttempts = async (actor: { id: string; role: string }) => {
  const where: Prisma.AttemptWhereInput = { cheatFlagged: true };
  if (actor.role === "TEACHER") {
    const groups = await prisma.classGroup.findMany({ where: { teacherId: actor.id }, select: { levelId: true } });
    const levelIds = [...new Set(groups.map((g) => g.levelId))];
    if (!levelIds.length) return [];
    where.assessment = { levelId: { in: levelIds } };
  }
  return prisma.attempt.findMany({ where, take: 100, orderBy: { updatedAt: "desc" }, include: { student: { select: { studentCode: true, user: { select: { firstName: true, lastName: true } } } }, assessment: { select: { title: true } } } });
};
