import type { Prisma } from "../../generated/prisma/client.js";
import { badRequest } from "../../lib/http-error.js";

export interface ApplicationChoices {
  levelId?: string | null;
  intakeId?: string | null;
  campusId?: string | null;
}

/** The level, intake and campus must be live, and the intake must still offer the level. */
export async function assertApplicationChoices(tx: Prisma.TransactionClient, choices: ApplicationChoices): Promise<void> {
  const { levelId, intakeId, campusId } = choices;
  if (levelId) {
    const level = await tx.level.findUnique({ where: { id: levelId }, select: { isActive: true } });
    if (!level?.isActive) throw badRequest("Choose an available level");
  }
  if (intakeId) {
    const intake = await tx.intake.findUnique({
      where: { id: intakeId },
      select: { isActive: true, endDate: true, levels: { select: { id: true } } },
    });
    if (!intake?.isActive || intake.endDate < new Date()) throw badRequest("Choose an open intake");
    if (levelId && !intake.levels.some((level) => level.id === levelId)) throw badRequest("This level is not offered in the selected intake");
  }
  if (campusId) {
    const campus = await tx.campus.findUnique({ where: { id: campusId }, select: { isActive: true } });
    if (!campus?.isActive) throw badRequest("Choose an available campus");
  }
}
