import { describe, expect, it } from "vitest";
import { gradeStructured } from "../../../src/modules/content/structured-grading.js";
import { lessonActivities } from "../html-course/activities.js";
import type { CourseItem } from "../html-course/activities.js";
import { estimateMinutes, renderLessonBody } from "../html-course/body.js";
import { loadCourse } from "../html-course/course.js";
import { planExistingModules } from "../html-course/existing-modules.js";
import { B1_SPEC, b1Id, b1ModuleId } from "./course.js";

const course = await loadCourse(B1_SPEC);
const B1_SIZE = B1_SPEC.size;

describe("B1 course manifest", () => {
  it("contains the full course: 8 modules, 24 lessons, 120 exercises, 288 words", () => {
    expect(course.module).toHaveLength(B1_SIZE.modules);
    const activities = course.lektionen.flatMap((lesson) => lessonActivities(lesson, course.source.file, b1Id));
    const items = activities.filter((a) => a.type !== "FLASHCARD").flatMap((a) => a.config.items as CourseItem[]);
    const cards = activities.filter((a) => a.type === "FLASHCARD").flatMap((a) => a.config.cards as unknown[]);
    expect(items).toHaveLength(B1_SIZE.exercises);
    expect(cards).toHaveLength(B1_SIZE.words);
    expect(new Set(activities.map((a) => a.id)).size).toBe(activities.length);
  });

  it("grades every authored solution, including each alternative, as correct", () => {
    for (const lesson of course.lektionen) {
      for (const activity of lessonActivities(lesson, course.source.file, b1Id).filter((a) => a.type !== "FLASHCARD")) {
        const [item] = activity.config.items as CourseItem[];
        expect(gradeStructured({ a: item.answer }, [item]).isCorrect).toBe(true);
        for (const alternative of item.answers ?? []) expect(gradeStructured({ a: alternative }, [item]).isCorrect).toBe(true);
        expect(gradeStructured({ a: "falsch" }, [item]).isCorrect).toBe(false);
      }
    }
  });

  it("renders reader sections with escaped text, tables, vocabulary and a compressed photo", () => {
    const html = renderLessonBody(course.lektionen[0]);
    expect(html.match(/<h2>/g)).toHaveLength(2 + course.lektionen[0].grammatik.length + 1);
    expect(html).toContain("<h2>Grammatik: Adjektive als Nomen</h2>");
    expect(html).toContain('class="course-table-wrap"');
    expect(html).toContain("EN: friendship · FR: <span lang=\"fr\">l'amitié</span>");
    expect(html).toContain("https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=800&amp;q=60&amp;auto=format");
    expect(html).not.toMatch(/<script|onerror/i);
    expect(estimateMinutes(course.lektionen[0])).toBeGreaterThanOrEqual(40);
  });
});

describe("existing B1 modules", () => {
  const base = { description: null, isPublished: true, hasStudentWork: false };
  it("deletes unused placeholders, archives used ones and moves colliding staff modules", () => {
    const plan = planExistingModules("B1", [
      { ...base, id: "p1", title: "B1 — Grundlagen", order: 1 },
      { ...base, id: "p2", title: "B1 — Aufbau & Anwendung", order: 2, hasStudentWork: true },
      { ...base, id: "s1", title: "Zusatz: Prüfungstraining", order: 3 },
      { ...base, id: "s2", title: "Extra", order: 12 },
      { ...base, id: b1ModuleId(1), title: "Menschen und Alltag", order: 1 },
    ], new Set([b1ModuleId(1)]), 8);
    expect(plan).toEqual([
      { id: "p1", title: "B1 — Grundlagen", action: "delete" },
      { id: "p2", title: "B1 — Aufbau & Anwendung", action: "archive", order: -1000 },
      { id: "s1", title: "Zusatz: Prüfungstraining", action: "move", order: 13 },
      { id: "s2", title: "Extra", action: "keep" },
    ]);
  });
});
