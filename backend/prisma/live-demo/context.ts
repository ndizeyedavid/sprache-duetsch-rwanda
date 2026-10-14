import { prisma } from "../../src/lib/prisma.js";
import { DEMO_INTAKE } from "./accounts.js";

export type DemoContext = {
  intakeId: string;
  levels: Map<string, string>;
  campuses: Map<string, string>;
  methods: Map<string, string>;
  staff: Map<string, string>;
  /** student key → { userId, studentId, enrollmentId } */
  students: Map<string, { userId: string; studentId: string; enrollmentId: string | null }>;
  classes: Map<"A1" | "B1", string>;
};

export const daysFromNow = (days: number, hour = 18) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  date.setUTCHours(hour - 2, 0, 0, 0); // Kigali is UTC+2
  return date;
};

/** Reads the configuration the live site already has; the demo never creates levels, campuses or lessons. */
export async function loadContext(): Promise<DemoContext> {
  const intake = await prisma.intake.findUnique({ where: { code: DEMO_INTAKE } });
  if (!intake) throw new Error(`Intake ${DEMO_INTAKE} is missing`);
  const toMap = (rows: { id: string; code: string }[]) => new Map(rows.map((row) => [row.code, row.id]));
  return {
    intakeId: intake.id,
    levels: toMap(await prisma.level.findMany({ select: { id: true, code: true } })),
    campuses: toMap(await prisma.campus.findMany({ select: { id: true, code: true } })),
    methods: toMap(await prisma.paymentMethodConfig.findMany({ select: { id: true, code: true } })),
    staff: new Map(),
    students: new Map(),
    classes: new Map(),
  };
}
