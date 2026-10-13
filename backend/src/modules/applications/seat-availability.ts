import { prisma } from "../../lib/prisma.js";
import { seatsLeft } from "./application-policy.js";

export interface SeatRow {
  levelId: string;
  intakeId: string;
  campusId: string;
  capacity: number;
  enrolled: number;
  seatsLeft: number | null;
}

const key = (row: { levelId: string; intakeId: string; campusId: string }) => `${row.levelId}|${row.intakeId}|${row.campusId}`;

/**
 * Seats per level + intake + campus: active class capacity minus active enrolments.
 * Two grouped queries, so it stays cheap enough for the public catalogue.
 */
export async function seatAvailability(intakeIds: string[]): Promise<SeatRow[]> {
  if (intakeIds.length === 0) return [];
  const [classes, enrolments] = await Promise.all([
    prisma.classGroup.groupBy({
      by: ["levelId", "intakeId", "campusId"],
      where: { intakeId: { in: intakeIds }, isActive: true },
      _sum: { capacity: true },
    }),
    prisma.enrollment.groupBy({
      by: ["levelId", "intakeId", "campusId"],
      where: { intakeId: { in: intakeIds }, status: "ACTIVE" },
      _count: { _all: true },
    }),
  ]);
  const enrolled = new Map(enrolments.map((row) => [key(row), row._count._all]));
  return classes.map((row) => {
    const capacity = row._sum.capacity ?? 0;
    const occupied = enrolled.get(key(row)) ?? 0;
    return { levelId: row.levelId, intakeId: row.intakeId, campusId: row.campusId, capacity, enrolled: occupied, seatsLeft: seatsLeft(capacity, occupied) };
  });
}

/** Totals for one level + intake across every campus. */
export function seatTotals(rows: SeatRow[], levelId: string | null, intakeId: string | null) {
  const matching = rows.filter((row) => row.levelId === levelId && row.intakeId === intakeId);
  const capacity = matching.reduce((sum, row) => sum + row.capacity, 0);
  const enrolled = matching.reduce((sum, row) => sum + row.enrolled, 0);
  return { capacity, enrolled, seatsLeft: seatsLeft(capacity, enrolled) };
}
