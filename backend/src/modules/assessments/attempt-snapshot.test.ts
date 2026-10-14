import { describe, expect, it } from "vitest";
import type { SnapshotQuestion } from "./attempt-snapshot.js";
import { publicSnapshot } from "./attempt-snapshot.js";

describe("publicSnapshot", () => {
  it("removes answer keys and explanations from open questions", () => {
    const row = { id: "r1", order: 0, points: null, question: { id: "q1", type: "SINGLE_CHOICE", points: "1", correctAnswer: "bin",
      explanation: "Erste Person Singular von «sein» ist «bin».", prompt: "Ich ___ Student.", options: ["bin", "bist"],
      audioUrl: null, imageUrl: null, skill: "GRAMMAR", difficulty: "EASY" } } as SnapshotQuestion;
    const [open] = publicSnapshot([row]);
    expect(open.question).not.toHaveProperty("correctAnswer");
    expect(open.question).not.toHaveProperty("explanation");
    expect(open.question.prompt).toBe("Ich ___ Student.");
  });
});
