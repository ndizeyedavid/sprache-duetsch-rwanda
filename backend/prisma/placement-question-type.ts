import type { Skill } from "../src/generated/prisma/client.js";

/** One objective placement question. `key` is stable: it derives the question id. */
export interface PlacementQuestionSeed {
  key: string;
  band: "A1" | "A2" | "B1" | "B2";
  skill: Skill;
  type: "SINGLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
  prompt: string;
  /** Choices for SINGLE_CHOICE / TRUE_FALSE; FILL_BLANK has none. */
  options?: string[];
  /** Exactly one accepted answer (graded trimmed and case-insensitive). */
  answer: string;
  explanation: string;
}

export const TRUE_FALSE = ["Richtig", "Falsch"];
