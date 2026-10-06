import { prisma } from "../src/lib/prisma.js";
import { intakes } from './base-intakes.js';
export const seedIntakes = async () => {
  const byCode = new Map<string, string>();
  for (const intake of intakes) {
    const record = await prisma.intake.upsert({
      where: { code: intake.code },
      update: { ...intake },
      create: { ...intake },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};
