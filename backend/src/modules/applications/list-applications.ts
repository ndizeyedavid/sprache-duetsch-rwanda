import type { ApplicationStatus,Prisma } from "../../generated/prisma/client.js";
import { buildPaginated,parsePagination } from "../../lib/pagination.js";
import { prisma } from "../../lib/prisma.js";
import { applicationListInclude } from "./application-select.js";
import type { ListApplicationsQuery } from "./applications.schema.js";

const endOfDay = (date: Date): Date => new Date(date.getTime() + 24 * 3_600_000 - 1);

export function applicationWhere(query: Omit<ListApplicationsQuery, "page" | "pageSize" | "status">): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = {};
  if (query.source) where.source = query.source;
  if (query.levelId) where.levelId = query.levelId;
  if (query.intakeId) where.intakeId = query.intakeId;
  if (query.campusId) where.campusId = query.campusId;
  if (query.from || query.to) {
    where.createdAt = { ...(query.from ? { gte: query.from } : {}), ...(query.to ? { lte: endOfDay(query.to) } : {}) };
  }
  if (query.search) {
    const contains = { contains: query.search, mode: "insensitive" as const };
    where.OR = [{ firstName: contains }, { lastName: contains }, { email: contains }, { reference: contains }, { phone: contains }];
  }
  return where;
}

export const listApplications = async (query: ListApplicationsQuery) => {
  const pagination = parsePagination(query);
  const where: Prisma.ApplicationWhereInput = { ...applicationWhere(query), ...(query.status ? { status: query.status } : {}) };
  // The waitlist reads first-come first-served; every other queue shows newest first.
  const orderBy: Prisma.ApplicationOrderByWithRelationInput[] = query.status === "WAITLISTED"
    ? [{ waitlistedAt: "asc" }, { createdAt: "asc" }]
    : [{ createdAt: "desc" }];
  const [rows, total] = await prisma.$transaction([
    prisma.application.findMany({ where, orderBy, skip: pagination.skip, take: pagination.take, include: applicationListInclude }),
    prisma.application.count({ where }),
  ]);
  return buildPaginated(rows, total, pagination);
};

/** Count per status for the queue tabs, honouring every filter except status. */
export const applicationSummary = async (query: ListApplicationsQuery) => {
  const groups = await prisma.application.groupBy({ by: ["status"], where: applicationWhere(query), _count: { _all: true } });
  const counts: Record<ApplicationStatus, number> = {
    NEW: 0, REVIEWING: 0, ACCEPTED: 0, WAITLISTED: 0, REJECTED: 0, ENROLLED: 0, WITHDRAWN: 0,
  };
  for (const group of groups) counts[group.status] = group._count._all;
  return counts;
};
