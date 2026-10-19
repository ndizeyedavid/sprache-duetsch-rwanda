import type { Prisma,Role } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { FINANCE_ROLES } from "../../lib/roles.js";
import { loadFinanceLedger } from "../payments/finance-ledger.js";
import { computeFinance } from "../payments/finance-reports.js";
import type { IntakePhase } from "./intake-phase.js";
import { intakePhase,isEnrollmentOpen } from "./intake-phase.js";

export interface IntakeFinanceTotals { billed: string; collected: string; outstanding: string }

/**
 * Feeds the staff intake switcher. Teachers only see intakes where they teach a class group and
 * every count is limited to their own class groups. Finance totals are attached for finance
 * roles only — academic admins and teachers never receive money.
 */
export async function getIntakeOverview(actor: { id: string; role: Role }, now = new Date()) {
  const teacherId = actor.role === "TEACHER" ? actor.id : undefined;
  const classWhere: Prisma.ClassGroupWhereInput = teacherId ? { teacherId } : {};
  const enrollmentWhere: Prisma.EnrollmentWhereInput = teacherId ? { classGroup: { teacherId } } : {};
  const [classGroups, enrollmentGroups, studentPairs] = await Promise.all([
    prisma.classGroup.groupBy({ by: ["intakeId"], where: classWhere, _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ["intakeId"], where: enrollmentWhere, _count: { _all: true } }),
    prisma.enrollment.groupBy({ by: ["intakeId", "studentId"], where: enrollmentWhere }),
  ]);
  const intakes = await prisma.intake.findMany({
    where: teacherId ? { OR: [{ id: { in: classGroups.map(row => row.intakeId) } }, { teachers: { some: { teacherId } } }] } : {},
    orderBy: { startDate: "desc" },
    select: { id: true, code: true, name: true, startDate: true, endDate: true, registrationOpen: true,
      isActive: true, currency: true, levels: { select: { code: true }, orderBy: [{ order: "asc" }, { code: "asc" }] } },
  });
  const classes = new Map(classGroups.map(row => [row.intakeId, row._count._all]));
  const enrollments = new Map(enrollmentGroups.map(row => [row.intakeId, row._count._all]));
  const students = new Map<string, number>();
  for (const row of studentPairs) students.set(row.intakeId, (students.get(row.intakeId) ?? 0) + 1);
  const finance = FINANCE_ROLES.includes(actor.role) ? computeFinance(await loadFinanceLedger(), {}, now).intakes : null;

  return intakes.map(intake => {
    const bucket = finance?.get(intake.id);
    return {
      id: intake.id, code: intake.code, name: intake.name,
      startDate: intake.startDate, endDate: intake.endDate,
      registrationOpen: intake.registrationOpen,
      isActive: intake.isActive, currency: intake.currency,
      phase: intakePhase(intake, now) satisfies IntakePhase,
      enrollmentOpen: isEnrollmentOpen(intake, now),
      levels: intake.levels.map(level => level.code),
      counts: { students: students.get(intake.id) ?? 0, enrollments: enrollments.get(intake.id) ?? 0, classes: classes.get(intake.id) ?? 0 },
      ...(finance ? { finance: {
        billed: bucket?.billed.toString() ?? "0",
        collected: bucket?.collected.toString() ?? "0",
        outstanding: bucket?.outstanding.toString() ?? "0",
      } satisfies IntakeFinanceTotals } : {}),
    };
  });
}
