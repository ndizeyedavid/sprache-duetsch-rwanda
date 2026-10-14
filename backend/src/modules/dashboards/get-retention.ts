import type { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import type { RetentionQuery } from "./analytics.schema.js";
import type { StatusCounts } from "./retention-math.js";
import { addStatus,emptyCounts,withRates } from "./retention-math.js";

/** Withdrawal date + reason come from the enrolment audit trail, falling back to the row's updatedAt. */
async function recentWithdrawals(where: Prisma.EnrollmentWhereInput, since: Date) {
  const rows = await prisma.enrollment.findMany({ where: { ...where, status: "WITHDRAWN", updatedAt: { gte: since } }, orderBy: { updatedAt: "desc" }, take: 50, select: {
    id: true, enrolledAt: true, updatedAt: true,
    student: { select: { id: true, studentCode: true, user: { select: { firstName: true, lastName: true } } } },
    level: { select: { code: true } }, intake: { select: { name: true } }, classGroup: { select: { name: true } },
  } });
  const audits = rows.length ? await prisma.auditLog.findMany({ where: { entityType: "Enrollment", entityId: { in: rows.map(r => r.id) }, action: "ENROLLMENT_UPDATED", after: { path: ["status"], equals: "WITHDRAWN" } },
    orderBy: { createdAt: "desc" }, select: { entityId: true, createdAt: true, reason: true } }) : [];
  return rows.map(row => {
    const audit = audits.find(a => a.entityId === row.id);
    return { enrollmentId: row.id, student: { id: row.student.id, studentCode: row.student.studentCode, ...row.student.user },
      level: row.level.code, intake: row.intake.name, className: row.classGroup?.name ?? null,
      enrolledAt: row.enrolledAt, withdrawnAt: audit?.createdAt ?? row.updatedAt, reason: audit?.reason ?? null };
  }).filter(row => row.withdrawnAt >= since).sort((a, b) => b.withdrawnAt.getTime() - a.withdrawnAt.getTime());
}

export async function getRetention(query: RetentionQuery, now = new Date()) {
  const where: Prisma.EnrollmentWhereInput = {};
  if (query.intakeId) where.intakeId = query.intakeId;
  if (query.levelId) where.levelId = query.levelId;
  if (query.campusId) where.campusId = query.campusId;
  const since = new Date(now.getTime() - query.recentDays * 86_400_000);
  const [groups, dropouts] = await Promise.all([
    prisma.enrollment.groupBy({ by: ["intakeId", "levelId", "status"], where, _count: { _all: true } }),
    recentWithdrawals(where, since),
  ]);
  const [intakes, levels] = await Promise.all([
    prisma.intake.findMany({ where: { id: { in: [...new Set(groups.map(g => g.intakeId))] } }, select: { id: true, code: true, name: true, startDate: true, endDate: true, isActive: true } }),
    prisma.level.findMany({ where: { id: { in: [...new Set(groups.map(g => g.levelId))] } }, select: { id: true, code: true, title: true, order: true } }),
  ]);
  const totals = emptyCounts();
  const byIntake = new Map<string, { counts: StatusCounts; levels: Map<string, StatusCounts> }>();
  for (const group of groups) {
    const entry = byIntake.get(group.intakeId) ?? { counts: emptyCounts(), levels: new Map<string, StatusCounts>() };
    const levelCounts = entry.levels.get(group.levelId) ?? emptyCounts();
    addStatus(entry.counts, group.status, group._count._all);
    addStatus(levelCounts, group.status, group._count._all);
    addStatus(totals, group.status, group._count._all);
    entry.levels.set(group.levelId, levelCounts);
    byIntake.set(group.intakeId, entry);
  }
  const rows = intakes.sort((a, b) => b.startDate.getTime() - a.startDate.getTime()).map(intake => {
    const entry = byIntake.get(intake.id)!;
    return { intake, ...withRates(entry.counts), levels: levels.filter(l => entry.levels.has(l.id)).sort((a, b) => a.order - b.order)
      .map(level => ({ level: { id: level.id, code: level.code, title: level.title }, ...withRates(entry.levels.get(level.id)!) })) };
  });
  return { totals: withRates(totals), intakes: rows, recentDays: query.recentDays, dropouts };
}
