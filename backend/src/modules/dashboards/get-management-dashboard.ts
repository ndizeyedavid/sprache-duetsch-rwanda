import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { courseScope } from './course-scope.js';
import type { DashboardFilter } from "./dashboards.schema.js";
import { getAcademicDashboard } from './get-academic-dashboard.js';
import { getFinanceDashboard } from './get-finance-dashboard.js';
export const getManagementDashboard = async (filter: DashboardFilter) => {
  const [academic, finance] = await Promise.all([
    getAcademicDashboard(filter),
    getFinanceDashboard(filter),
  ]);

  const notificationWhere: Prisma.NotificationWhereInput = { type: "ANNOUNCEMENT" };
  if (filter.from || filter.to) {
    notificationWhere.createdAt = { gte: filter.from, lte: filter.to };
  }

  const sessionWhere: Prisma.ClassSessionWhereInput = {};
  const classWhere = courseScope(filter);
  if (Object.keys(classWhere).length > 0) sessionWhere.classGroup = classWhere;

  const liveSessions = { scheduled: 0, live: 0, completed: 0, cancelled: 0, rescheduled: 0 };

  const [notificationsSent, sessionGroups] = await Promise.all([
    prisma.notification.count({ where: notificationWhere }),
    prisma.classSession.groupBy({
      by: ["status"],
      where: sessionWhere,
      _count: { _all: true },
    }),
  ]);

  for (const group of sessionGroups) {
    if (group.status === "SCHEDULED") liveSessions.scheduled = group._count._all;
    else if (group.status === "LIVE") liveSessions.live = group._count._all;
    else if (group.status === "COMPLETED") liveSessions.completed = group._count._all;
    else if (group.status === "CANCELLED") liveSessions.cancelled = group._count._all;
    else if (group.status === "RESCHEDULED") liveSessions.rescheduled = group._count._all;
  }

  return { academic, finance, notificationsSent, liveSessions };
};
