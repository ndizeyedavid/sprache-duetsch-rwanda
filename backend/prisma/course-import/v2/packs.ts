// Where course v2 packs live and how they are loaded (validated) for a level.
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { A1_SPEC } from "../a1/course.js";
import { A2_SPEC } from "../a2/course.js";
import { B1_SPEC } from "../b1/course.js";
import { B2_SPEC } from "../b2/course.js";
import { loadCourse } from "../html-course/course.js";
import type { CourseSpec } from "../html-course/spec.js";
import type { CourseJson } from "../html-course/types.js";
import { lessonPack, levelGlossary } from "./pack-schema.js";
import type { Glossary, LessonPack } from "./pack-schema.js";
import { testPack } from "./test-schema.js";
import type { TestPack } from "./test-schema.js";

export const V2_LEVELS: Record<string, CourseSpec> = { A1: A1_SPEC, A2: A2_SPEC, B1: B1_SPEC, B2: B2_SPEC };

export function levelSpec(level: string): CourseSpec {
  const spec = V2_LEVELS[level.toUpperCase()];
  if (!spec) throw new Error(`Unknown level ${level}; expected one of ${Object.keys(V2_LEVELS).join(", ")}`);
  return spec;
}

export const packDir = (level: string) => new URL(`./packs/${level.toLowerCase()}/`, import.meta.url);
export const packFile = (level: string, lesson: number) => new URL(`lesson-${String(lesson).padStart(2, "0")}.json`, packDir(level));

/** Lesson numbers from "1-3,7" (all packs when empty). */
export function parseLessons(arg: string | undefined): number[] | null {
  if (!arg) return null;
  return arg.split(",").flatMap((part) => {
    const [from, to] = part.split("-").map(Number);
    if (!Number.isInteger(from) || (to !== undefined && !Number.isInteger(to))) throw new Error(`Bad --lessons value: ${arg}`);
    return Array.from({ length: (to ?? from) - from + 1 }, (_, index) => from + index);
  });
}

export async function loadLevelGlossary(level: string): Promise<Glossary> {
  const file = new URL("glossary.json", packDir(level));
  if (!existsSync(file)) return {};
  return levelGlossary.parse(JSON.parse(await readFile(file, "utf8")));
}

export type LoadedPack = { file: string; pack: LessonPack };

/** Every pack of the level (or the listed lessons), validated; throws with the file name on a bad pack. */
export async function loadPacks(level: string, lessons: number[] | null): Promise<LoadedPack[]> {
  const dir = packDir(level);
  const names = existsSync(dir) ? (await readdir(dir)).filter((name) => /^lesson-\d+\.json$/.test(name)).sort() : [];
  const wanted = lessons ? names.filter((name) => lessons.includes(Number(name.match(/\d+/)![0]))) : names;
  const loaded: LoadedPack[] = [];
  for (const name of wanted) {
    const parsed = lessonPack.safeParse(JSON.parse(await readFile(new URL(name, dir), "utf8")));
    if (!parsed.success) throw new Error(`${level}/${name}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
    if (parsed.data.level !== level.toUpperCase()) throw new Error(`${level}/${name}: pack says level ${parsed.data.level}`);
    loaded.push({ file: name, pack: parsed.data });
  }
  return loaded;
}

export type LoadedTest = { file: string; pack: TestPack };

/** Module tests (test-module-NN.json) and the final exam (test-final.json) of a level, validated. */
export async function loadTestPacks(level: string): Promise<LoadedTest[]> {
  const dir = packDir(level);
  const names = existsSync(dir) ? (await readdir(dir)).filter((name) => /^test-(module-\d+|final)\.json$/.test(name)).sort() : [];
  const loaded: LoadedTest[] = [];
  for (const name of names) {
    const parsed = testPack.safeParse(JSON.parse(await readFile(new URL(name, dir), "utf8")));
    if (!parsed.success) throw new Error(`${level}/${name}: ${parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ")}`);
    if (parsed.data.level !== level.toUpperCase()) throw new Error(`${level}/${name}: pack says level ${parsed.data.level}`);
    loaded.push({ file: name, pack: parsed.data });
  }
  return loaded;
}

export async function loadSource(level: string): Promise<{ spec: CourseSpec; course: CourseJson }> {
  const spec = levelSpec(level);
  return { spec, course: await loadCourse(spec) };
}
