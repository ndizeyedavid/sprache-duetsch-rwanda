import { badRequest } from "../../lib/http-error.js";
import { prisma } from "../../lib/prisma.js";
export const assertIntakeExists = async (intakeId: string): Promise<void> => {
  const intake = await prisma.intake.findUnique({ where: { id: intakeId }, select: { id: true } });
  if (!intake) {
    throw badRequest("Intake not found");
  }
};
