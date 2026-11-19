// Usage (from backend/): npx tsx prisma/course-import/translate/extract.ts [--levels A1,A2,B1,B2]
// Writes translate/work/<level>/lesson-NN.json with only what the translation memory does not have yet:
// German text (lesson page, activity prompts, explanations, model answers) to put into English, and the
// word forms students can tap, each with the first sentence it appears in. Every text and form goes to
// the first lesson that uses it (course order A1 → B2), so the files can be translated in parallel.
import { mkdir,writeFile } from "node:fs/promises";
import { prisma } from "../../../src/lib/prisma.js";
import { allTexts,loadBodyLessons,visibleTexts } from "./lessons.js";
import { glossed,loadMemory } from "./memory.js";
import { wordForms } from "./segments.js";

const arg = process.argv[process.argv.indexOf("--levels") + 1];
const levels = (process.argv.includes("--levels") && arg ? arg : "A1,A2,B1,B2").toUpperCase().split(",");

try {
  const memory = await loadMemory();
  const seenLines = new Set(Object.keys(memory.lines));
  const seenForms = new Set<string>();
  const summary: Record<string, { lessons: number; lines: number; characters: number; forms: number }> = {};
  for (const level of levels) {
    const dir = new URL(`./work/${level.toLowerCase()}/`, import.meta.url);
    await mkdir(dir, { recursive: true });
    const stats = summary[level] = { lessons: 0, lines: 0, characters: 0, forms: 0 };
    for (const entry of await loadBodyLessons(level)) {
      const lines = allTexts(entry).filter((text) => !seenLines.has(text));
      lines.forEach((text) => seenLines.add(text));
      const forms = [...wordForms(visibleTexts(entry))]
        .filter(([form]) => form.length > 1 && !glossed(memory, form) && !seenForms.has(form.toLowerCase()));
      forms.forEach(([form]) => seenForms.add(form.toLowerCase()));
      if (!lines.length && !forms.length) continue;
      const file = new URL(`lesson-${String(entry.nr).padStart(2, "0")}.json`, dir);
      await writeFile(file, `${JSON.stringify({
        level, lesson: entry.nr, title: entry.lesson.title,
        lines: lines.map((de) => ({ de, en: "" })),
        forms: forms.map(([form, context]) => ({ form, context, en: "", lemma: "" })),
      }, null, 1)}\n`);
      stats.lessons += 1;
      stats.lines += lines.length;
      stats.characters += lines.reduce((sum, text) => sum + text.length, 0);
      stats.forms += forms.length;
    }
  }
  console.log(JSON.stringify(summary, null, 2));
} finally {
  await prisma.$disconnect();
}
