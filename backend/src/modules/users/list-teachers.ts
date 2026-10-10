import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
export const listTeachers = async () =>
  prisma.user.findMany({
    where: { role: "TEACHER", status: "ACTIVE" },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: safeUserSelect,
  });
