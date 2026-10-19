import { courseIds } from "../html-course/spec.js";
import type { CourseSpec } from "../html-course/spec.js";

/** Complete A2.1/A2.2 course from the supplied HTML export. Keep this namespace stable. */
export const A2_SPEC: CourseSpec = {
  level: "A2",
  niveau: "A2",
  namespace: "sparch:a2:course:v1",
  html: "deutschsprache-a2.html",
  manifest: new URL("../a2-course.json", import.meta.url),
  backupName: "a2",
  size: { modules: 8, lessons: 24, exercises: 120, words: 288, writingTasks: 24 },
};

const ids = courseIds(A2_SPEC);
export const a2Id = ids.id;
export const a2ModuleId = ids.module;
export const a2LessonId = ids.lesson;
