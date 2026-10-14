import { courseIds } from "../html-course/spec.js";
import type { CourseSpec } from "../html-course/spec.js";

/** B1 course from deutschsprache-b1.html. The namespace keeps the ids of the original B1 import. */
export const B1_SPEC: CourseSpec = {
  level: "B1",
  niveau: "B1",
  namespace: "sparch:b1:course:v1",
  html: "deutschsprache-b1.html",
  manifest: new URL("../b1-course.json", import.meta.url),
  backupName: "b1",
  size: { modules: 8, lessons: 24, exercises: 120, words: 288, writingTasks: 0 },
};

const ids = courseIds(B1_SPEC);
export const b1Id = ids.id;
export const b1ModuleId = ids.module;
export const b1LessonId = ids.lesson;
