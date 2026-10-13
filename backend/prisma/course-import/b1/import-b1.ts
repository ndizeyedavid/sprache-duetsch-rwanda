// Usage (from backend/): npx tsx prisma/course-import/b1/import-b1.ts [--apply]
import { prisma } from "../../../src/lib/prisma.js";
import { importB1 } from "./b1-import.js";

try {
  console.log(JSON.stringify(await importB1({ apply: process.argv.includes("--apply") }), null, 2));
} finally {
  await prisma.$disconnect();
}
