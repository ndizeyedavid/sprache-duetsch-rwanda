// Usage (from backend/): npx tsx prisma/course-import/a2/import-a2.ts [--apply]
import { prisma } from "../../../src/lib/prisma.js";
import { importA2 } from "./a2-import.js";

try {
  console.log(JSON.stringify(await importA2({ apply: process.argv.includes("--apply") }), null, 2));
} finally {
  await prisma.$disconnect();
}
