// Turn a course lesson's exercises, vocabulary and writing task into Activity rows.
// Exercises use the self-study practice shape (`practiceMode` + `items`) graded by
// src/modules/content/structured-grading.ts; vocabulary becomes one FLASHCARD deck; the
// writing task is an open WRITING practice (saved, never auto-graded), like the A1 compositions.
import type { Prisma } from "../../../src/generated/prisma/client.js";
import type { CourseExercise, CourseLesson } from "./types.js";

export type CourseActivityData = {
  id: string;
  title: string;
  type: "FILL_BLANK" | "MCQ" | "FLASHCARD" | "WRITING";
  instructions: string;
  order: number;
  isPublished: true;
  config: Prisma.InputJsonObject;
};
export type CourseItem = { id: string; prompt: string; options?: string[]; answer: string; answers?: string[]; explanation: string };
/** Stable id for an activity key, e.g. `exercise:3.2`. */
export type ActivityIdFn = (key: string) => string;

const blankCount = (prompt: string) => (prompt.match(/_{3,}/g) ?? []).length;

/** One answer item; `answers` lists every accepted spelling (graded leniently, hidden until submit). */
export function exerciseItem(exercise: CourseExercise): CourseItem {
  if (exercise.typ === "mc") {
    return { id: "a", prompt: exercise.frage, options: exercise.optionen, answer: exercise.loesung, explanation: exercise.erklaerung };
  }
  const lenient = exercise.loesung.length > 1 || blankCount(exercise.frage) > 1;
  return {
    id: "a",
    prompt: exercise.frage,
    answer: exercise.loesung[0],
    ...(lenient ? { answers: exercise.loesung } : {}),
    explanation: exercise.erklaerung,
  };
}

function instructions(exercise: CourseExercise) {
  if (exercise.typ === "mc") return "Wählen Sie die richtige Antwort.";
  return blankCount(exercise.frage) > 1
    ? "Ergänzen Sie die Lücken. Schreiben Sie alle fehlenden Wörter der Reihe nach in das Antwortfeld."
    : "Ergänzen Sie die Lücke.";
}

export function exerciseActivities(lesson: CourseLesson, source: string, id: ActivityIdFn): CourseActivityData[] {
  return lesson.uebungen.map((exercise, index) => {
    const item = exerciseItem(exercise);
    return {
      id: id(`exercise:${lesson.nr}.${index + 1}`),
      title: `Übung ${lesson.nr}.${index + 1} · ${exercise.typ === "mc" ? "Auswahl" : "Lückentext"}`,
      type: exercise.typ === "mc" ? "MCQ" : "FILL_BLANK",
      instructions: instructions(exercise),
      order: index + 1,
      isPublished: true,
      config: {
        practiceMode: true,
        autoGraded: true,
        source,
        lesson: lesson.nr,
        items: [item],
        explanation: exercise.erklaerung,
      },
    };
  });
}

export function flashcardActivity(lesson: CourseLesson, id: ActivityIdFn): CourseActivityData {
  return {
    id: id(`flashcards:${lesson.nr}`),
    title: "Wortschatz · Lernkarten",
    type: "FLASHCARD",
    instructions: `Lernen Sie die ${lesson.wortschatz.length} Wörter dieser Lektion. Drehen Sie jede Karte um: Englisch / Französisch und ein Beispielsatz.`,
    order: 0,
    isPublished: true,
    config: {
      cards: lesson.wortschatz.map((word) => ({ front: word.wort, back: `${word.en} / ${word.fr}`, example: word.beispiel })),
    },
  };
}

/** Task, word range and checklist as plain text: the practice view keeps line breaks. */
export function writingInstruction(lesson: CourseLesson): string {
  const task = lesson.schreibaufgabe!;
  return [task.aufgabe, `Umfang: ${task.woerter}`, "Checkliste:", ...task.checkliste.map((point) => `• ${point}`)].join("\n");
}

export function writingActivity(lesson: CourseLesson, source: string, id: ActivityIdFn): CourseActivityData[] {
  if (!lesson.schreibaufgabe) return [];
  const instruction = writingInstruction(lesson);
  return [{
    id: id(`writing:${lesson.nr}`),
    title: "Schreibaufgabe",
    type: "WRITING",
    instructions: instruction,
    order: lesson.uebungen.length + 1,
    isPublished: true,
    config: {
      practiceMode: true,
      autoGraded: false,
      source,
      lesson: lesson.nr,
      instruction,
      wordRange: lesson.schreibaufgabe.woerter,
      checklist: lesson.schreibaufgabe.checkliste,
    },
  }];
}

export function lessonActivities(lesson: CourseLesson, source: string, id: ActivityIdFn): CourseActivityData[] {
  return [flashcardActivity(lesson, id), ...exerciseActivities(lesson, source, id), ...writingActivity(lesson, source, id)];
}
