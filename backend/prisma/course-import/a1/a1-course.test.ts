import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { describe, expect, it } from "vitest";
import { gradeActivity } from "../../../src/modules/content/activity-grading.js";
import { lessonActivities } from "../html-course/activities.js";
import type { CourseItem } from "../html-course/activities.js";
import { esc, renderLessonBody } from "../html-course/body.js";
import { loadCourse, validateCourse } from "../html-course/course.js";
import { planExistingModules } from "../html-course/existing-modules.js";
import { A1_BOOK_MODULE_IDS, A1_SPEC, a1CourseId } from "./course.js";

const course = await loadCourse(A1_SPEC);
const activities = course.lektionen.flatMap((lesson) => lessonActivities(lesson, course.source.file, a1CourseId));

describe("A1 curriculum (Kursprogramm)", () => {
  it("retains the supplied source, complete A1.1/A1.2 progression and all activities", async () => {
    const html = await readFile(new URL("../../../../deutschsprache-a1.html", import.meta.url), "utf8");
    const embedded = JSON.parse(html.match(/<script\b[^>]*\bid="course"[^>]*>([\s\S]*?)<\/script>/i)![1]) as unknown;
    const { source, ...content } = course;
    expect(content).toEqual(embedded);
    expect(source.sha256).toBe(createHash("sha256").update(html).digest("hex"));
    expect(course.module).toHaveLength(8);
    expect(course.lektionen).toHaveLength(24);
    expect(activities.filter((a) => ["MCQ", "FILL_BLANK"].includes(a.type))).toHaveLength(120);
    expect(activities.filter((a) => a.type === "FLASHCARD").flatMap((a) => a.config.cards as unknown[])).toHaveLength(288);
    expect(activities.filter((a) => a.type === "WRITING")).toHaveLength(24);
    expect(new Set(activities.map((a) => a.id)).size).toBe(168);
  });

  it("grades every source answer through the API grader and rejects incorrect answers", () => {
    for (const activity of activities.filter((a) => ["MCQ", "FILL_BLANK"].includes(a.type))) {
      const [item] = activity.config.items as CourseItem[];
      for (const answer of [item.answer, ...(item.answers ?? [])]) {
        expect(gradeActivity(activity.type, { a: answer }, activity.config).isCorrect).toBe(true);
      }
      expect(gradeActivity(activity.type, { a: "definitely incorrect" }, activity.config).isCorrect).toBe(false);
    }
  });

  it("preserves all dialogue lines, learning objectives, grammar, vocabulary and phrases", () => {
    for (const lesson of course.lektionen) {
      const html = renderLessonBody(lesson);
      expect(html).toContain(`<h2>Dialog: ${esc(lesson.dialog!.titel)}</h2>`);
      for (const line of lesson.dialog!.zeilen) {
        expect(html).toContain(`<strong>${esc(line.wer)}:</strong> ${esc(line.text)}`);
      }
      for (const text of [...lesson.lernziele, ...lesson.grammatik.map((g) => g.erklaerung),
        ...lesson.wortschatz.map((w) => w.beispiel), ...lesson.redemittel.flatMap((r) => r.saetze)]) {
        expect(html).toContain(esc(text));
      }
      expect(html).not.toMatch(/<script|onerror/i);
    }
  });

  it("escapes dialogue markup and rejects incomplete conversations before importing", () => {
    const lesson = { ...course.lektionen[0], dialog: { titel: "<Title>", zeilen: [{ wer: "<Speaker>", text: "<script>alert(1)</script>" }] } };
    expect(renderLessonBody(lesson)).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(() => validateCourse(A1_SPEC, {
      ...course, lektionen: [{ ...lesson, dialog: { titel: "Dialog", zeilen: [] } }, ...course.lektionen.slice(1)],
    })).toThrow("incomplete dialog");
  });

  it("keeps writing as self-study without automatic grades and preserves its checklist", () => {
    for (const lesson of course.lektionen) {
      const writing = activities.find((a) => a.id === a1CourseId(`writing:${lesson.nr}`))!;
      expect(writing.config).toMatchObject({ practiceMode: true, autoGraded: false, checklist: lesson.schreibaufgabe!.checkliste });
      expect(writing.instructions).toContain(lesson.schreibaufgabe!.aufgabe);
      expect(gradeActivity("WRITING", "My composition", writing.config).auto).toBe(false);
    }
  });
});

describe("A1 replaces the PDF coursebook edition", () => {
  const existing = (id: string, order: number, isPublished = true, hasStudentWork = false) =>
    ({ id, title: id, description: null, order, isPublished, hasStudentWork });
  it("archives every retired coursebook module (with or without student work) and keeps others", () => {
    const [part1, part2] = A1_BOOK_MODULE_IDS;
    const plan = planExistingModules("A1", [
      existing(part1, 1, true, true), existing(part2, 2), existing("staff-extra", 12), existing("old-archived", -1001, false),
    ], new Set(), 8, new Set([...A1_BOOK_MODULE_IDS, "old-archived"]));
    expect(plan.find((p) => p.id === part1)).toMatchObject({ action: "archive" });
    expect(plan.find((p) => p.id === part2)).toMatchObject({ action: "archive" });
    expect(plan.filter((p) => p.action === "archive").every((p) => "order" in p && p.order < 0)).toBe(true);
    expect(plan.find((p) => p.id === "staff-extra")).toMatchObject({ action: "keep" });
    expect(plan.find((p) => p.id === "old-archived")).toMatchObject({ action: "keep" });
    expect(A1_BOOK_MODULE_IDS).toHaveLength(10);
  });
});
