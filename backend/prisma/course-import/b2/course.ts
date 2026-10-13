import { courseIds } from "../html-course/spec.js";
import type { CourseSpec } from "../html-course/spec.js";

/**
 * B2.1 course (first half of B2) from deutschsprache-b2-1.html, imported into the B2 level as
 * modules 1–6. The namespace is B2.1-specific so a later B2.2 export gets its own ids.
 */
export const B2_SPEC: CourseSpec = {
  level: "B2",
  niveau: "B2.1",
  namespace: "sparch:b2-1:course:v1",
  html: "deutschsprache-b2-1.html",
  manifest: new URL("../b2-course.json", import.meta.url),
  backupName: "b2",
  size: { modules: 6, lessons: 18, exercises: 108, words: 252, writingTasks: 18 },
};

const ids = courseIds(B2_SPEC);
export const b2Id = ids.id;
export const b2ModuleId = ids.module;
export const b2LessonId = ids.lesson;
