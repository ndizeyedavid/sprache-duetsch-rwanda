// Usage (from backend/): npx tsx prisma/course-import/translate/merge.ts [--allow-partial]
// Adds translated work files (translate/work/<level>/lesson-NN.json) to the translation memory.
// A file that does not pass check-work.ts is skipped, unless --allow-partial merges its finished items.
// Word forms marked "=" (not German) are remembered as ["="], so they are not extracted again and
// never become tappable.
import { readdir,readFile } from "node:fs/promises";
import { loadMemory,saveMemory,SAME } from "./memory.js";
import { workFileSchema,workProblems } from "./work-file.js";

const partial = process.argv.includes("--allow-partial");
const root = new URL("./work/", import.meta.url);

const memory = await loadMemory();
const report = { files: 0, skipped: [] as string[], lines: 0, forms: 0 };
for (const level of (await readdir(root)).sort()) {
  for (const name of (await readdir(new URL(`${level}/`, root))).filter((file) => file.endsWith(".json")).sort()) {
    const file = workFileSchema.parse(JSON.parse(await readFile(new URL(`${level}/${name}`, root), "utf8")));
    const problems = workProblems(file);
    if (problems.length && !partial) { report.skipped.push(`${level}/${name}: ${problems.length} problems`); continue; }
    report.files += 1;
    for (const line of file.lines) {
      const en = line.en.trim();
      if (!en) continue;
      memory.lines[line.de] = en;
      report.lines += 1;
    }
    for (const form of file.forms) {
      const en = form.en.trim();
      if (!en) continue;
      const lemma = form.lemma.trim();
      memory.glossary[form.form] = en === SAME ? [SAME] : lemma && lemma !== form.form ? [en, lemma] : [en];
      report.forms += 1;
    }
  }
}
await saveMemory(memory);
console.log(JSON.stringify({ ...report, memory: { lines: Object.keys(memory.lines).length, forms: Object.keys(memory.glossary).length } }, null, 2));
