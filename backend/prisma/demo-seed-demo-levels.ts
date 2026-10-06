import { prisma } from "../src/lib/prisma.js";
import { demoLevels } from './demo-demo-levels.js';
export const seedDemoLevels = async () => {
  const byCode = new Map<string, string>();
  for (const level of demoLevels) {
    const record = await prisma.level.upsert({
      where: { code: level.code },
      update: { ...level, isActive: true },
      create: { ...level, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};
