// Usage (from backend/): npx tsx prisma/course-import/a1/import-a1.ts [--apply]
import { prisma } from "../../../src/lib/prisma.js";
import { importA1Course } from "./a1-import.js";

try {
  console.log(JSON.stringify(await importA1Course({ apply: process.argv.includes("--apply") }), null, 2));
} finally {
  await prisma.$disconnect();
}
