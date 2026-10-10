import { prisma } from "../src/lib/prisma.js";
import { levels } from './base-levels.js';
export const seedLevels = async () => {
  const byCode = new Map<string, string>();
  for (const level of levels) {
    const record = await prisma.level.upsert({
      where: { code: level.code },
      update: { ...level, isActive: true },
      create: { ...level, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};
