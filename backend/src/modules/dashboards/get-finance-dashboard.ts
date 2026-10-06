import { refreshFinanceProfiles } from "../../lib/finance.js";
import { prisma } from "../../lib/prisma.js";
import { getFinanceSummary } from "../payments/finance-reports.js";
import type { DashboardFilter } from "./dashboards.schema.js";
export const getFinanceDashboard = async (filter: DashboardFilter) => {
  await refreshFinanceProfiles();
  const summary = await getFinanceSummary(filter);
  const overdueCount = await prisma.studentFinance.count({ where: { overdueAmount: { gt: 0 }, ...(filter.campusId || filter.intakeId || filter.levelId ? { student: { enrollments: { some: { campusId: filter.campusId, intakeId: filter.intakeId, levelId: filter.levelId } } } } : {}) } });
  return { ...summary, overdueCount, byPaymentMethod: summary.byMethod.map(row => ({ methodId: row.methodId, name: row.methodName, total: row.total })) };
};
