import { prisma } from "../src/lib/prisma.js";
import { seedDemoClasses } from './demo-seed-demo-classes.js';
import { seedDemoContent } from './demo-seed-demo-content.js';
import { seedDemoLevels } from './demo-seed-demo-levels.js';
import { seedDemoStudentsAndFinance } from './demo-seed-demo-students-and-finance.js';
export const main = async () => {
  console.info("→ Seeding additional demo levels (A2, B1, B2, B1-BERUF, B2-TESTDAF)");
  const levelIds = await seedDemoLevels();

  const remera = await prisma.campus.findUnique({ where: { code: "REMERA" } });
  if (!remera) {
    throw new Error("Base seed must be run first: 'npm run db:seed'");
  }

  const intake = await prisma.intake.findUnique({ where: { code: "INTAKE-2026-09" } });
  if (!intake) {
    throw new Error("Base seed must be run first: 'npm run db:seed'");
  }

  console.info("→ Seeding demo class groups");
  const classIds = await seedDemoClasses({
    levelIds,
    campusId: remera.id,
    intakeId: intake.id,
  });

  console.info("→ Seeding demo curriculum (modules and lessons)");
  await seedDemoContent({ levelIds });

  console.info("→ Seeding demo students and enrollments");
  await seedDemoStudentsAndFinance({
    levelIds,
    classIds,
    campusId: remera.id,
  });

  console.info("✔ Demo seed complete");
};
