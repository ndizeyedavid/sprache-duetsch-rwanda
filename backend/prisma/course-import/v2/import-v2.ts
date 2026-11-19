// Usage (from backend/): npx tsx prisma/course-import/v2/import-v2.ts --level A1 [--lessons 1-3] [--apply]
// Dry-run by default: prints what would change and writes v2/audio-<LEVEL>.json for generate_audio.py.
import { prisma } from "../../../src/lib/prisma.js";
import { importV2 } from "./importer.js";
import { parseLessons } from "./packs.js";

const arg = (name: string) => { const index = process.argv.indexOf(name); return index > 0 ? process.argv[index + 1] : undefined; };

try {
  const level = arg("--level");
  if (!level) throw new Error("--level is required (A1, A2, B1 or B2)");
  console.log(JSON.stringify(await importV2(level.toUpperCase(), parseLessons(arg("--lessons")), { apply: process.argv.includes("--apply") }), null, 2));
} finally {
  await prisma.$disconnect();
}
