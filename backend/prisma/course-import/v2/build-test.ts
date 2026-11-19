// Test pack → Questions in the shapes the existing quiz engine grades (SINGLE_CHOICE, FILL_BLANK,
// ORDERING, MATCHING, ESSAY) plus the sections the test screen groups them by (Assessment.sections):
// a section's instructions, reading text and shared recording appear once, above its questions.
import { stableShuffle } from "../../../src/modules/content/activity-shuffle.js";
import type { AudioCollector } from "./audio.js";
import { sentenceTiles } from "./build-sessions.js";
import type { TestPack, TestQuestion, TestSection } from "./test-schema.js";

export type BuiltQuestion = {
  key: string;
  skill: TestSection["skill"];
  type: "SINGLE_CHOICE" | "FILL_BLANK" | "ORDERING" | "MATCHING" | "ESSAY";
  prompt: string;
  options: unknown;
  correctAnswer: unknown;
  audioUrl: string | null;
  explanation: string | null;
  points: number;
};

/** One Assessment.sections entry (src/modules/assessments/assessment-sections.ts) before keys become ids. */
export type BuiltSection = {
  title: string;
  intro: string;
  passage: string | null;
  audioUrl: string | null;
  plays: number | null;
  letters: boolean;
  skill: TestSection["skill"];
  questionKeys: string[];
};

function ask(question: TestQuestion): string {
  switch (question.type) {
    case "choose": return question.prompt;
    case "truefalse": {
      // Context first (a sign and where it hangs), separated by blank lines; the statement is the last paragraph.
      const parts = question.statement.split(/\n\s*\n/);
      return [...parts.slice(0, -1), `Richtig oder falsch? ${parts.at(-1) ?? ""}`].join("\n\n");
    }
    case "fill": return question.prompt;
    case "order": return `Bilden Sie den Satz. · Build the sentence: “${question.en}”`;
    case "match": return question.prompt;
    case "write": return `${question.prompt}\n${question.promptEn}`;
  }
}

function shape(question: TestQuestion, key: string): Pick<BuiltQuestion, "type" | "options" | "correctAnswer" | "points"> {
  switch (question.type) {
    case "choose": return { type: "SINGLE_CHOICE", options: question.options, correctAnswer: question.answer, points: 1 };
    case "truefalse": return { type: "SINGLE_CHOICE", options: ["Richtig", "Falsch"], correctAnswer: question.answer ? "Richtig" : "Falsch", points: 1 };
    case "fill": return { type: "FILL_BLANK", options: null, correctAnswer: question.answer, points: 1 };
    case "order": {
      const tiles = sentenceTiles(question.answer);
      return { type: "ORDERING", options: stableShuffle(tiles, key), correctAnswer: tiles, points: 1 };
    }
    case "match": return {
      type: "MATCHING",
      options: { left: question.pairs.map(([left]) => left), right: stableShuffle(question.pairs.map(([, right]) => right), key) },
      correctAnswer: Object.fromEntries(question.pairs), points: 1,
    };
    case "write": return { type: "ESSAY", options: null, correctAnswer: null, points: question.points };
  }
}

/** Stable key of the assessment, e.g. `v2:test:module:1` or `v2:test:final:0`. */
export const testKey = (pack: TestPack) => `v2:test:${pack.kind}:${pack.module ?? 0}`;

export function buildTest(pack: TestPack, audio: AudioCollector): { questions: BuiltQuestion[]; sections: BuiltSection[] } {
  let number = 0;
  const questions: BuiltQuestion[] = [];
  const sections = pack.sections.map((section): BuiltSection => {
    const questionKeys = section.questions.map((question) => {
      number += 1;
      const key = `${testKey(pack)}:q${number}`;
      const listen = question.type === "choose" || question.type === "truefalse" ? question.listen : undefined;
      const explanation = question.type === "write" ? `Musterlösung · Model answer: ${question.modelAnswer}`
        : "explanation" in question ? question.explanation ?? null : null;
      questions.push({ key, skill: section.skill, prompt: ask(question), audioUrl: audio.script(listen) ?? null, explanation, ...shape(question, key) });
      return key;
    });
    return {
      title: `${section.title} · ${section.titleEn}`, intro: section.intro, passage: section.passage ?? null, audioUrl: audio.script(section.listen) ?? null,
      plays: section.plays ?? null, letters: section.letters ?? false, skill: section.skill, questionKeys,
    };
  });
  return { questions, sections };
}

export const testQuestionCount = (pack: TestPack) => pack.sections.reduce((sum, section) => sum + section.questions.length, 0);
