import { prisma } from "../src/lib/prisma.js";
import { demoLevels } from './demo-demo-levels.js';
import { teacherByLevel } from './demo-teacher-by-level.js';
export const seedDemoClasses = async (params: {
  levelIds: Map<string, string>;
  campusId: string;
  intakeId: string;
}) => {
  const { levelIds, campusId, intakeId } = params;
  const byLevel = new Map<string, string>();

  for (const level of demoLevels) {
    const levelId = levelIds.get(level.code)!;
    const code = `CLS-${level.code}-2026-09`;

    const teacherEmail = teacherByLevel[level.code];
    const teacher = teacherEmail
      ? await prisma.user.findUnique({ where: { email: teacherEmail }, select: { id: true } })
      : null;

    const record = await prisma.classGroup.upsert({
      where: { code },
      update: {
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: teacher?.id ?? null,
        shift: "EVENING",
        isActive: true,
      },
      create: {
        code,
        name: `${level.title} — Abendkurs`,
        levelId,
        intakeId,
        campusId,
        teacherId: teacher?.id ?? null,
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
