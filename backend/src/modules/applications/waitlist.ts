import { prisma } from "../../lib/prisma.js";
import { groupWaitlist,waitlistKey } from "./application-policy.js";
import type { WaitlistQuery } from "./applications.schema.js";
import { seatAvailability,seatTotals } from "./seat-availability.js";

/**
 * Waitlisted applicants per level + intake in first-come order, with the seats still free
 * (active class capacity minus active enrolments) and accepted applicants not yet enrolled.
 */
export const getWaitlist = async (query: WaitlistQuery) => {
  const rows = await prisma.application.findMany({
    where: { status: "WAITLISTED", ...(query.levelId ? { levelId: query.levelId } : {}), ...(query.intakeId ? { intakeId: query.intakeId } : {}) },
    orderBy: [{ waitlistedAt: "asc" }, { createdAt: "asc" }],
    select: {
      id: true, reference: true, firstName: true, lastName: true, email: true, phone: true, shift: true,
      levelId: true, intakeId: true, waitlistedAt: true, createdAt: true, decisionReason: true,
      level: { select: { id: true, code: true, title: true } },
      intake: { select: { id: true, code: true, name: true, startDate: true } },
      campus: { select: { id: true, code: true, name: true } },
    },
  });
  const intakeIds = [...new Set(rows.map((row) => row.intakeId).filter((id): id is string => Boolean(id)))];
  const [seats, accepted] = await Promise.all([
    seatAvailability(intakeIds),
    prisma.application.groupBy({ by: ["levelId", "intakeId"], where: { status: "ACCEPTED", intakeId: { in: intakeIds } }, _count: { _all: true } }),
  ]);
  const acceptedByKey = new Map(accepted.map((row) => [waitlistKey(row), row._count._all]));

  return groupWaitlist(rows).map((group) => {
    const first = group.entries[0];
    return {
      key: group.key,
      level: first?.level ?? null,
      intake: first?.intake ?? null,
      waiting: group.entries.length,
      acceptedPending: acceptedByKey.get(group.key) ?? 0,
      ...seatTotals(seats, group.levelId, group.intakeId),
      entries: group.entries,
    };
  });
};
