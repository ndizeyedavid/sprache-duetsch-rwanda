import { describe, expect, it } from "vitest";
import { gradeStructured } from "../../../src/modules/content/structured-grading.js";
import { lessonActivities } from "../html-course/activities.js";
import type { CourseItem } from "../html-course/activities.js";
import { estimateMinutes, renderLessonBody } from "../html-course/body.js";
import { loadCourse } from "../html-course/course.js";
import { planExistingModules } from "../html-course/existing-modules.js";
import { B2_SPEC, b2Id, b2ModuleId } from "./course.js";

const course = await loadCourse(B2_SPEC);
const activities = course.lektionen.flatMap((lesson) => lessonActivities(lesson, course.source.file, b2Id));

describe("B2.1 course manifest", () => {
  it("contains the full course: 6 modules, 18 lessons, 108 exercises, 252 words, 18 writing tasks", () => {
    expect(course.module).toHaveLength(B2_SPEC.size.modules);
    const items = activities.filter((a) => a.type === "MCQ" || a.type === "FILL_BLANK").flatMap((a) => a.config.items as CourseItem[]);
    const cards = activities.filter((a) => a.type === "FLASHCARD").flatMap((a) => a.config.cards as unknown[]);
    expect(items).toHaveLength(B2_SPEC.size.exercises);
    expect(cards).toHaveLength(B2_SPEC.size.words);
    expect(activities.filter((a) => a.type === "WRITING")).toHaveLength(B2_SPEC.size.writingTasks);
    expect(new Set(activities.map((a) => a.id)).size).toBe(activities.length);
  });

  it("grades every authored solution, including each alternative, as correct", () => {
    for (const activity of activities.filter((a) => a.type === "MCQ" || a.type === "FILL_BLANK")) {
      const [item] = activity.config.items as CourseItem[];
      expect(gradeStructured({ a: item.answer }, [item]).isCorrect).toBe(true);
      for (const alternative of item.answers ?? []) expect(gradeStructured({ a: alternative }, [item]).isCorrect).toBe(true);
      expect(gradeStructured({ a: "falsch" }, [item]).isCorrect).toBe(false);
    }
  });

  it("accepts every alternative answer listed in the source (e.g. bloß / nur)", () => {
    const item = activities.find((a) => a.id === b2Id("exercise:11.5"))!.config.items as CourseItem[];
    expect(item[0].answers).toEqual(["bloß", "nur"]);
    expect(gradeStructured({ a: "nur" }, item).isCorrect).toBe(true);
  });

  it("turns each writing task into an open practice composition with its checklist", () => {
    const writing = activities.find((a) => a.id === b2Id("writing:1"))!;
    expect(writing).toMatchObject({ type: "WRITING", order: 7, config: { practiceMode: true, autoGraded: false, wordRange: "180–220 Wörter" } });
    expect(writing.instructions).toContain("Umfang: 180–220 Wörter\nCheckliste:\n• Stellen Sie am Anfang");
    expect(writing.config).not.toHaveProperty("items");
  });

  it("renders reader sections with text type, exam relevance, tables and a compressed photo", () => {
    const lesson = course.lektionen[0];
    const html = renderLessonBody(lesson);
    expect(html.match(/<h2>/g)).toHaveLength(2 + lesson.grammatik.length + 1);
    expect(html).toContain("<p><strong>Textsorte:</strong> Radiosendung · Erfahrungsbericht</p>");
    expect(html).toContain("<p><strong>Prüfungsbezug:</strong> Goethe B2 Sprechen Teil 1");
    expect(html).toContain('class="course-table-wrap"');
    expect(html).toContain("https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=800&amp;q=60&amp;auto=format");
    expect(html).not.toMatch(/<script|onerror/i);
    expect(estimateMinutes(lesson)).toBeGreaterThanOrEqual(60);
  });
});

describe("existing B2 modules", () => {
  it("deletes the unused B2 seed placeholders and leaves B1 placeholders alone", () => {
    const base = { description: null, isPublished: true, hasStudentWork: false };
    const plan = planExistingModules("B2", [
      { ...base, id: "p1", title: "B2 — Grundlagen", order: 1 },
      { ...base, id: "p2", title: "B2 — Aufbau & Anwendung", order: 2 },
      { ...base, id: "x1", title: "B1 — Grundlagen", order: 20 },
      { ...base, id: b2ModuleId(1), title: "Den Horizont erweitern", order: 1 },
    ], new Set([b2ModuleId(1)]), 6);
    expect(plan).toEqual([
      { id: "p1", title: "B2 — Grundlagen", action: "delete" },
      { id: "p2", title: "B2 — Aufbau & Anwendung", action: "delete" },
      { id: "x1", title: "B1 — Grundlagen", action: "keep" },
    ]);
  });
});
