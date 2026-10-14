import { describe,expect,it } from "vitest";
import { pickPlacementLevel } from "./pick-placement-level.js";
import { checkPlacementDecision,placementStatus } from "./placement-decision.js";
import { scorePlacement } from "./placement-scoring.js";
import { manualPlacementSchema,placementDecisionSchema } from "./placement.schema.js";

const level = (id: string, order: number, placementMinScore: number | null, isActive = true) => ({ id, order, placementMinScore, isActive });
const catalogue = [
  level("B1-BERUF", 5, null),
  level("B2", 4, 80),
  level("A1", 1, 0),
  level("B1", 3, 55),
  level("A2", 2, 30),
  level("B2-TESTDAF", 6, null),
];

describe("pickPlacementLevel", () => {
  it("recommends the highest active level whose band the score reaches", () => {
    expect(pickPlacementLevel(catalogue, 0)?.id).toBe("A1");
    expect(pickPlacementLevel(catalogue, 29)?.id).toBe("A1");
    expect(pickPlacementLevel(catalogue, 30)?.id).toBe("A2");
    expect(pickPlacementLevel(catalogue, 54)?.id).toBe("A2");
    expect(pickPlacementLevel(catalogue, 55)?.id).toBe("B1");
    expect(pickPlacementLevel(catalogue, 79)?.id).toBe("B1");
    expect(pickPlacementLevel(catalogue, 80)?.id).toBe("B2");
    expect(pickPlacementLevel(catalogue, 100)?.id).toBe("B2");
  });

  it("never recommends levels without a placement band (specialised tracks)", () => {
    const ids = [0, 25, 50, 75, 100].map((score) => pickPlacementLevel(catalogue, score)?.id);
    expect(ids).not.toContain("B1-BERUF");
    expect(ids).not.toContain("B2-TESTDAF");
  });

  it("skips inactive levels", () => {
    const withInactiveB2 = catalogue.map((row) => (row.id === "B2" ? { ...row, isActive: false } : row));
    expect(pickPlacementLevel(withInactiveB2, 95)?.id).toBe("B1");
  });

  it("falls back to the lowest active banded level when no band matches", () => {
    const noZeroBand = [level("A2", 2, 30), level("B1", 3, 55), level("SPEC", 0, null)];
    expect(pickPlacementLevel(noZeroBand, 10)?.id).toBe("A2");
  });

  it("falls back to the lowest active level when no level has a band", () => {
    expect(pickPlacementLevel([level("X", 3, null), level("Y", 1, null)], 70)?.id).toBe("Y");
  });

  it("returns null when nothing is active", () => {
    expect(pickPlacementLevel([level("A1", 1, 0, false)], 50)).toBeNull();
    expect(pickPlacementLevel([], 50)).toBeNull();
  });
});

describe("checkPlacementDecision", () => {
  it("confirms the recommendation without a reason and drops any stray reason", () => {
    expect(checkPlacementDecision({ recommendedLevelId: "A2", assignedLevelId: "A2" })).toEqual({ ok: true, isOverride: false, overrideReason: null });
    expect(checkPlacementDecision({ recommendedLevelId: "A2", assignedLevelId: "A2", overrideReason: "fine" })).toEqual({ ok: true, isOverride: false, overrideReason: null });
  });

  it("requires a non-blank reason to override", () => {
    expect(checkPlacementDecision({ recommendedLevelId: "A2", assignedLevelId: "B1" }).ok).toBe(false);
    expect(checkPlacementDecision({ recommendedLevelId: "A2", assignedLevelId: "B1", overrideReason: "   " }).ok).toBe(false);
    expect(checkPlacementDecision({ recommendedLevelId: "A2", assignedLevelId: "B1", overrideReason: " Strong speaking interview " }))
      .toEqual({ ok: true, isOverride: true, overrideReason: "Strong speaking interview" });
  });
});

describe("placementStatus", () => {
  it("orders open attempt, latest result, then availability", () => {
    expect(placementStatus({ hasTest: true, hasActiveAttempt: true, latest: { assignedLevelId: "A1" } })).toBe("IN_PROGRESS");
    expect(placementStatus({ hasTest: true, hasActiveAttempt: false, latest: { assignedLevelId: null } })).toBe("AWAITING_DECISION");
    expect(placementStatus({ hasTest: false, hasActiveAttempt: false, latest: { assignedLevelId: "B1" } })).toBe("CONFIRMED");
    expect(placementStatus({ hasTest: true, hasActiveAttempt: false, latest: null })).toBe("NOT_TAKEN");
    expect(placementStatus({ hasTest: false, hasActiveAttempt: false, latest: null })).toBe("UNAVAILABLE");
  });
});

describe("scorePlacement", () => {
  const questions = [
    { id: "q1", type: "SINGLE_CHOICE" as const, correctAnswer: "Guten Morgen", points: 1 },
    { id: "q2", type: "TRUE_FALSE" as const, correctAnswer: "Richtig", points: 1 },
    { id: "q3", type: "FILL_BLANK" as const, correctAnswer: "bin", points: 2 },
    { id: "q4", type: "ESSAY" as const, correctAnswer: null, points: 5 },
  ];

  it("grades objective answers case- and space-insensitively and ignores subjective points", () => {
    const result = scorePlacement(questions, { q1: "guten morgen", q2: "Falsch", q3: "  Bin ", q4: "Ich heisse..." });
    expect(result.score).toBe(3);
    expect(result.maxScore).toBe(4);
    expect(result.percentage).toBe(75);
    expect(result.answers.find((answer) => answer.questionId === "q4")?.isCorrect).toBeNull();
    expect(result.answers.find((answer) => answer.questionId === "q2")?.isCorrect).toBe(false);
  });

  it("counts unanswered questions as wrong and stores no row for them", () => {
    const result = scorePlacement(questions, { q1: "Guten Morgen" });
    expect(result.percentage).toBe(25);
    expect(result.answers).toHaveLength(1);
  });

  it("returns 0% for a test without objective questions", () => {
    expect(scorePlacement([questions[3]], { q4: "text" }).percentage).toBe(0);
  });
});

describe("placement schemas", () => {
  it("validates manual scores and decisions", () => {
    expect(manualPlacementSchema.safeParse({ score: 101 }).success).toBe(false);
    expect(manualPlacementSchema.safeParse({ score: "64", note: "" }).data).toEqual({ score: 64, note: undefined, overrideReason: undefined });
    expect(placementDecisionSchema.safeParse({}).success).toBe(false);
  });
});
