import { a1Id as bookId } from "../a1-manifest.js";
import { courseIds } from "../html-course/spec.js";
import type { CourseSpec } from "../html-course/spec.js";

/** The ten part-modules of the earlier PDF coursebook import (namespace sparch:a1:book:v1). */
export const A1_BOOK_MODULE_IDS = Array.from({ length: 10 }, (_, index) => bookId(`part:${index + 1}`));

/**
 * Complete A1.1/A1.2 course ("Deutsch A1 — Kursprogramm") from the supplied HTML export.
 * It replaces the PDF coursebook edition, whose modules are archived with their history.
 * Keep this namespace stable.
 */
export const A1_SPEC: CourseSpec = {
  level: "A1",
  niveau: "A1",
  namespace: "sparch:a1:course:v1",
  html: "deutschsprache-a1.html",
  manifest: new URL("../a1-kursprogramm.json", import.meta.url),
  backupName: "a1-course",
  size: { modules: 8, lessons: 24, exercises: 120, words: 288, writingTasks: 24 },
  retiredModuleIds: A1_BOOK_MODULE_IDS,
};

const ids = courseIds(A1_SPEC);
export const a1CourseId = ids.id;
export const a1ModuleId = ids.module;
export const a1LessonId = ids.lesson;
