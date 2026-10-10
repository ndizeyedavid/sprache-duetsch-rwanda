import { prisma } from "../src/lib/prisma.js";
import { levels } from './base-levels.js';
import { teacherByLevel } from './base-teacher-by-level.js';
export const seedClasses = async (params: {
  levelIds: Map<string, string>;
  intakeIds: Map<string, string>;
  campusIds: Map<string, string>;
  staffIds: Map<string, string>;
}) => {
  const { levelIds, intakeIds, campusIds, staffIds } = params;
  const byLevel = new Map<string, string>();
  const campusId = campusIds.get("REMERA")!;
  const intakeId = intakeIds.get("INTAKE-2026-09")!;

  for (const level of levels) {
    const levelId = levelIds.get(level.code)!;
    const code = `CLS-${level.code}-2026-09`;
    const record = await prisma.classGroup.upsert({
      where: { code },
      update: {
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: staffIds.get(teacherByLevel[level.code]) ?? null,
        shift: "EVENING",
        isActive: true,
      },
      create: {
        code,
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: staffIds.get(teacherByLevel[level.code]) ?? null,
        shift: "EVENING",
        capacity: 30,
        room: "Raum 2",
        isActive: true,
      },
    });
    byLevel.set(level.code, record.id);
  }
  return byLevel;
};
