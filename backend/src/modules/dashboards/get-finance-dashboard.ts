import { refreshFinanceProfiles } from "../../lib/finance.js";
import { prisma } from "../../lib/prisma.js";
import { getFinanceReport } from "../payments/finance-reports.js";
import type { DashboardFilter } from "./dashboards.schema.js";
export const getFinanceDashboard = async (filter: DashboardFilter) => {
  await refreshFinanceProfiles();
  const { summary, overdueStudentIds } = await getFinanceReport(filter);
  // Scoped: students with an overdue obligation inside the scope (same attribution as the
  // summary). Unscoped: every student whose finance profile shows an overdue amount.
  const scoped = Boolean(filter.campusId || filter.intakeId || filter.levelId);
  const overdueCount = scoped ? overdueStudentIds.size : await prisma.studentFinance.count({ where: { overdueAmount: { gt: 0 } } });
  return { ...summary, overdueCount, byPaymentMethod: summary.byMethod.map(row => ({ methodId: row.methodId, name: row.methodName, total: row.total })) };
};
