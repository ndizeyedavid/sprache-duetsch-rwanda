// Usage (from backend/): npx tsx prisma/course-import/import-a1.ts [--apply]
import { prisma } from "../../src/lib/prisma.js";
import { importA1 } from "./a1-import.js";

try {
  console.log(JSON.stringify(await importA1({ apply: process.argv.includes("--apply") })));
} finally {
  await prisma.$disconnect();
}
