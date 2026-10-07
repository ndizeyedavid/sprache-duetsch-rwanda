import { prisma } from "../../lib/prisma.js";
import { safeUserSelect } from './safe-user-select.js';
import { studentListWhere } from './student-list-where.js';
import type { ListStudentsQuery } from "./students.schema.js";
export const exportStudents = async (query: ListStudentsQuery, includeFinance = false) => {
  const rows = await prisma.student.findMany({
    where: studentListWhere(query),
    orderBy: { createdAt: "desc" },
    take: 5000,
    include: {
      user: { select: safeUserSelect },
      campus: { select: { name: true } },
      intake: { select: { name: true } },
      currentLevel: { select: { code: true } },
      finance: true,
    },
  });

  return rows.map((row) => ({
    studentCode: row.studentCode,
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    email: row.user.email,
    phone: row.user.phone ?? "",
    status: row.status,
    shift: row.shift,
    campus: row.campus?.name ?? "",
    intake: row.intake?.name ?? "",
    currentLevel: row.currentLevel?.code ?? "",
    ...(includeFinance ? { totalDue: row.finance?.totalDue.toString() ?? "0",
    totalPaid: row.finance?.totalPaid.toString() ?? "0",
    balance: row.finance?.balance.toString() ?? "0",
    financeStatus: row.finance?.status ?? "" } : {}),
    createdAt: row.createdAt.toISOString(),
  }));
};
