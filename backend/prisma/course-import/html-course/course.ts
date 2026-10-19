import { readFile } from "node:fs/promises";
import type { CourseSpec } from "./spec.js";
import type { CourseJson } from "./types.js";

const count = (course: CourseJson) => ({
  exercises: course.lektionen.reduce((n, l) => n + l.uebungen.length, 0),
  words: course.lektionen.reduce((n, l) => n + l.wortschatz.length, 0),
  writingTasks: course.lektionen.filter((l) => l.schreibaufgabe).length,
});

/** Structural checks that keep a broken export from reaching the database. */
export function validateCourse(spec: CourseSpec, course: CourseJson): CourseJson {
  const fail = (message: string): never => { throw new Error(`Invalid ${spec.level} course: ${message}`); };
  if (course.meta?.niveau !== spec.niveau) fail(`expected niveau ${spec.niveau}, got ${course.meta?.niveau}`);
  if (course.module?.length !== spec.size.modules) fail(`expected ${spec.size.modules} modules`);
  if (course.lektionen?.length !== spec.size.lessons) fail(`expected ${spec.size.lessons} lessons`);
  course.module.forEach((module, index) => { if (module.nr !== index + 1) fail(`module ${module.nr} is out of order`); });
  course.lektionen.forEach((lesson, index) => {
    const at = `lesson ${lesson.nr}`;
    if (lesson.nr !== index + 1) fail(`${at} is out of order`);
    if (!course.module.some((m) => m.nr === lesson.modul && m.lektionen.includes(lesson.nr))) fail(`${at} has no module`);
    if (!lesson.titel || !lesson.thema || !lesson.grammatik.length || !lesson.wortschatz.length) fail(`${at} is incomplete`);
    const task = lesson.schreibaufgabe;
    if (task && (!task.aufgabe || !task.woerter || !task.checkliste?.length)) fail(`${at} has an incomplete writing task`);
    const dialog = lesson.dialog;
    if (dialog && (!dialog.titel || !dialog.zeilen?.length
      || dialog.zeilen.some((line) => !line.wer || !line.text))) fail(`${at} has an incomplete dialog`);
    for (const exercise of lesson.uebungen) {
      if (!exercise.frage || !exercise.erklaerung) fail(`${at} has an empty exercise`);
      if (exercise.typ === "gap" && !exercise.loesung.length) fail(`${at} gap without answer`);
      if (exercise.typ === "mc" && !exercise.optionen.includes(exercise.loesung)) fail(`${at} choice answer not in options`);
      if (exercise.typ !== "gap" && exercise.typ !== "mc") fail(`${at} unknown exercise type`);
    }
  });
  const totals = count(course);
  for (const key of ["exercises", "words", "writingTasks"] as const) {
    if (totals[key] !== spec.size[key]) fail(`expected ${spec.size[key]} ${key}, got ${totals[key]}`);
  }
  return course;
}

export async function loadCourse(spec: CourseSpec): Promise<CourseJson> {
  return validateCourse(spec, JSON.parse(await readFile(spec.manifest, "utf8")) as CourseJson);
}

export function summarizeCourse(spec: CourseSpec, course: CourseJson) {
  const totals = count(course);
  return {
    level: spec.level,
    source: course.source.file,
    sha256: course.source.sha256,
    modules: course.module.length,
    lessons: course.lektionen.length,
    exercises: totals.exercises,
    flashcards: totals.words,
    writingTasks: totals.writingTasks,
  };
}
