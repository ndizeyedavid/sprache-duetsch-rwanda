import type { Prisma } from "../../generated/prisma/client.js";
import type { DashboardFilter } from "./dashboards.schema.js";
export const emptyStudentScope = (filter: DashboardFilter): Prisma.StudentWhereInput => {
  const where: Prisma.StudentWhereInput = {};
  if (filter.campusId) where.campusId = filter.campusId;
  if (filter.intakeId) where.intakeId = filter.intakeId;
  if (filter.levelId) {
    where.enrollments = { some: { levelId: filter.levelId, status: "ACTIVE" } };
  }
  return where;
};
