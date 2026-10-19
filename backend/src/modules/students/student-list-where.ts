import type { Prisma } from "../../generated/prisma/client.js";
import { andWhere,studentIntakeWhere } from "../../lib/intake-scope.js";
import type { ListStudentsQuery } from "./students.schema.js";
export const studentListWhere = (query: ListStudentsQuery): Prisma.StudentWhereInput => {
  const where: Prisma.StudentWhereInput = {};
  if (query.campusId) where.campusId = query.campusId;
  if (query.currentLevelId) where.currentLevelId = query.currentLevelId;
  if (query.status) where.status = query.status;
  if (query.shift) where.shift = query.shift;
  if (query.search) {
    where.OR = [
      { studentCode: { contains: query.search, mode: "insensitive" } },
      { user: { email: { contains: query.search, mode: "insensitive" } } },
      { user: { firstName: { contains: query.search, mode: "insensitive" } } },
      { user: { lastName: { contains: query.search, mode: "insensitive" } } },
    ];
  }
  return andWhere(where, query.intakeId && studentIntakeWhere(query.intakeId));
};
