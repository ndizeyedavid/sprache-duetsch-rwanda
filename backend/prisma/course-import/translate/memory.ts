// Translation memory for the HTML lessons: every German text block already translated (lines.json) and
// every word form already glossed (glossary.json, the v2 Entry shape: [English] or [English, dictionary
// form]). Shared by all levels, so a heading or word is translated once. "=" marks text that is already
// English (older content): it gets no English line.
import { existsSync } from "node:fs";
import { readFile,writeFile } from "node:fs/promises";
import { levelGlossary } from "../v2/pack-schema.js";
import type { Glossary } from "../v2/pack-schema.js";
import { lookup } from "../v2/tokens.js";

export const SAME = "=";
const dir = new URL("./memory/", import.meta.url);
const linesFile = new URL("lines.json", dir);
const glossaryFile = new URL("glossary.json", dir);
const seedGlossary = new URL("../v2/packs/a1/glossary.json", import.meta.url);

export type Memory = { lines: Record<string, string>; glossary: Glossary };

async function readJson(file: URL): Promise<unknown> {
  return existsSync(file) ? JSON.parse(await readFile(file, "utf8")) : {};
}

/** The memory, seeded with the A1 v2 glossary the first time. */
export async function loadMemory(): Promise<Memory> {
  const lines = await readJson(linesFile) as Record<string, string>;
  const glossary = levelGlossary.parse(existsSync(glossaryFile) ? await readJson(glossaryFile) : await readJson(seedGlossary));
  return { lines, glossary };
}

export async function saveMemory(memory: Memory): Promise<void> {
  await writeFile(linesFile, `${JSON.stringify(memory.lines, null, 1)}\n`);
  await writeFile(glossaryFile, `${JSON.stringify(memory.glossary, null, 1)}\n`);
}

/** Known meaning of a word form, trying the same case variants as the student view. */
export const glossed = (memory: Memory, form: string) => lookup(memory.glossary, form);
