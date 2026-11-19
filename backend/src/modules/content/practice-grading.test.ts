import { describe,expect,it } from "vitest";
import { gradeActivity } from "./activity-grading.js";
import { sanitizeActivityConfig } from "./assignment-config.js";
import { sessionXp } from "./learning-events.js";
import { gradePractice } from "./practice-grading.js";

const config = { v: 2, session: "words", items: [{ id: "a", kind: "choose", answer: "x" }, { id: "b", kind: "fill", answer: "y" }, { id: "c", kind: "speak" }] };

describe("gradePractice", () => {
  it("scores the share right first time and always completes", () => {
    expect(gradePractice({ results: { a: true, b: false, c: true } }, config)).toEqual({ isCorrect: true, score: 0.67, auto: true });
    expect(gradePractice({ results: {} }, config).score).toBe(0);
  });

  it("ignores result keys that are not items", () => {
    expect(gradePractice({ results: { a: true, b: true, c: true, zzz: true } }, config).score).toBe(1);
  });

  it("is what gradeActivity uses for PRACTICE", () => {
    expect(gradeActivity("PRACTICE", { results: { a: true } }, config).score).toBe(0.33);
  });
});

describe("practice sessions", () => {
  it("keep their answer keys for the browser", () => {
    expect(sanitizeActivityConfig(config, "PRACTICE")).toEqual(config);
  });

  it("earn 10 XP, 15 with at least 90% right first time", () => {
    expect(sessionXp(0.5)).toBe(10);
    expect(sessionXp(0.9)).toBe(15);
  });
});
