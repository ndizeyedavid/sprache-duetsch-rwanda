import { prisma } from "../../lib/prisma.js";
import { seatAvailability } from "../applications/seat-availability.js";

const SHIFTS = [
  { value: "MORNING", label: "Morning" },
  { value: "AFTERNOON", label: "Afternoon" },
  { value: "EVENING", label: "Evening" },
  { value: "WEEKEND", label: "Weekend" },
] as const;

type Window = { startDate: Date; enrollmentOpensAt: Date | null; enrollmentEndsAt: Date | null };

/** OPEN while applications are taken now; UPCOMING when the enrolment window opens later. */
const enrollmentState = (intake: Window, now: Date): "OPEN" | "UPCOMING" =>
  intake.enrollmentOpensAt && intake.enrollmentOpensAt > now ? "UPCOMING" : "OPEN";

/**
 * Public course catalogue: published levels and fees, intakes still taking applications,
 * active campuses and shifts. Seat hints come from class capacity, never from student data.
 */
export const getCatalog = async () => {
  const now = new Date();
  const [levels, intakes, campuses] = await Promise.all([
    prisma.level.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { code: "asc" }],
      select: { id: true, code: true, language: true, title: true, levelLabel: true, summary: true, objectives: true, defaultFee: true, currency: true, order: true },
    }),
    prisma.intake.findMany({
      where: { isActive: true, endDate: { gte: now }, OR: [{ enrollmentEndsAt: null }, { enrollmentEndsAt: { gte: now } }] },
      orderBy: { startDate: "asc" },
      select: {
        id: true, code: true, name: true, startDate: true, endDate: true, enrollmentOpensAt: true, enrollmentEndsAt: true,
        registrationFee: true, bookFee: true, currency: true,
        levels: { where: { isActive: true }, orderBy: { order: "asc" }, select: { id: true, code: true, title: true } },
      },
    }),
    prisma.campus.findMany({ where: { isActive: true }, orderBy: { name: "asc" }, select: { id: true, code: true, name: true, address: true, phone: true, email: true } }),
  ]);

  const seats = await seatAvailability(intakes.map((intake) => intake.id));
  return {
    levels,
    intakes: intakes
      .filter((intake) => intake.levels.length > 0)
      .map((intake) => ({
        ...intake,
        enrollmentState: enrollmentState(intake, now),
        seats: seats
          .filter((row) => row.intakeId === intake.id)
          .map((row) => ({ levelId: row.levelId, campusId: row.campusId, seatsLeft: row.seatsLeft })),
      })),
    campuses,
    shifts: SHIFTS,
    generatedAt: now.toISOString(),
  };
};
