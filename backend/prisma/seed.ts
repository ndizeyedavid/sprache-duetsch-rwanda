import { prisma } from "../src/lib/prisma.js";
import { main } from './base-main.js';
main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
