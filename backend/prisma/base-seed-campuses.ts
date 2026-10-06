import { prisma } from "../src/lib/prisma.js";
import { campuses } from './base-campuses.js';
export const seedCampuses = async () => {
  const byCode = new Map<string, string>();
  for (const campus of campuses) {
    const record = await prisma.campus.upsert({
      where: { code: campus.code },
      update: { ...campus, isActive: true },
      create: { ...campus, isActive: true },
    });
    byCode.set(record.code, record.id);
  }
  return byCode;
};
