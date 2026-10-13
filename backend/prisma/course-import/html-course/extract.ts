// Extract the course JSON embedded in a deutschsprache.org HTML export into its checked-in manifest.
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { summarizeCourse, validateCourse } from "./course.js";
import type { CourseSpec } from "./spec.js";
import type { CourseJson } from "./types.js";

const repoRoot = new URL("../../../../", import.meta.url);

export async function extractCourse(spec: CourseSpec, path?: string) {
  const source = resolve(path ?? fileURLToPath(new URL(spec.html, repoRoot)));
  const html = await readFile(source, "utf8");
  const match = html.match(/<script\b[^>]*\bid=["']course["'][^>]*>([\s\S]*?)<\/script>/i);
  if (!match) throw new Error(`No <script id="course"> block found in ${source}`);

  const embedded = JSON.parse(match[1]) as Omit<CourseJson, "source">;
  const course = validateCourse(spec, {
    source: { file: basename(source), sha256: createHash("sha256").update(html).digest("hex") },
    ...embedded,
  });
  await writeFile(spec.manifest, `${JSON.stringify(course, null, 2)}\n`);
  return { written: fileURLToPath(spec.manifest), ...summarizeCourse(spec, course) };
}
