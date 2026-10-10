import type { Prisma } from "../../generated/prisma/client.js";
import type { DashboardFilter } from "./dashboards.schema.js";
export const courseScope = (filter: DashboardFilter): Prisma.ClassGroupWhereInput => {
  const where: Prisma.ClassGroupWhereInput = {};
  if (filter.levelId) where.levelId = filter.levelId;
  if (filter.intakeId) where.intakeId = filter.intakeId;
  if (filter.campusId) where.campusId = filter.campusId;
  if (filter.teacherId) where.teacherId = filter.teacherId;
  return where;
};
