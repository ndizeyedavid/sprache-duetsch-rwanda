import { prisma } from "../src/lib/prisma.js";
import { main } from './demo-main.js';
main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
