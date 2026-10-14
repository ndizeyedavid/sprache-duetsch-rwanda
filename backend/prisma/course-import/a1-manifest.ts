import { readFile } from "node:fs/promises";
import { stableId } from "./stable-id.js";

export type A1Exercise = {
  key: string;
  prompt: string;
  modelAnswer: string | null;
  options?: string[] | null;
  correctIndex?: number | null;
};
export type A1Unit = {
  number: number;
  title: string;
  body: string;
  part: number;
  pages: number[];
  exercises: A1Exercise[];
};
export type A1Manifest = {
  source: string;
  sha256: string;
  units: A1Unit[];
  parts: { number: number; title: string; from: number; to: number }[];
};

/** Namespace used since the first A1 import; changing it would duplicate the course. */
export const a1Id = (key: string) => stableId("sparch:a1:book:v1", key);

export async function loadA1Manifest() {
  const book = JSON.parse(await readFile(new URL("./a1-course.json", import.meta.url), "utf8")) as A1Manifest;
  const checks = JSON.parse(await readFile(new URL("./checks.json", import.meta.url), "utf8")) as string[][];
  if (
    book.units.length !== 50 ||
    checks.length !== 50 ||
    book.units.some((u, i) => u.number !== i + 1 || !u.body || !checks[i]?.[1])
  ) {
    throw new Error("Invalid or incomplete course manifest");
  }
  return { book, checks };
}

/** Every id the A1 importer owns (modules, lessons, quick checks, exercises). */
export function a1ImportIds(book: A1Manifest): Set<string> {
  const ids = new Set(book.parts.map((p) => a1Id(`part:${p.number}`)));
  for (const unit of book.units) {
    ids.add(a1Id(`unit:${unit.number}`));
    ids.add(a1Id(`check:${unit.number}`));
    for (const exercise of unit.exercises) ids.add(a1Id(`exercise:${exercise.key}`));
  }
  return ids;
}
