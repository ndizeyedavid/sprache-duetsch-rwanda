import { prisma } from "../src/lib/prisma.js";
import { seedPlacementTest } from "./seed-placement-test.js";

/** Standalone runner: `npx tsx prisma/seed-placement.ts` (safe to re-run). */
seedPlacementTest()
  .then((result) => {
    console.info(`✔ Placement test ${result.assessmentId}: ${result.questions} questions, ${result.retired} legacy test(s) retired`);
  })
  .catch((error) => {
    console.error("Placement seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
