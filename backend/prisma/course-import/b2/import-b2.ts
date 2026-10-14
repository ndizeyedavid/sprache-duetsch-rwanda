// Usage (from backend/): npx tsx prisma/course-import/b2/import-b2.ts [--apply]
import { prisma } from "../../../src/lib/prisma.js";
import { importB2 } from "./b2-import.js";

try {
  console.log(JSON.stringify(await importB2({ apply: process.argv.includes("--apply") }), null, 2));
} finally {
  await prisma.$disconnect();
}
