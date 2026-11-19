// Course v2 test pack: a module test (packs/<level>/test-module-NN.json) or the level's mock final exam
// (packs/<level>/test-final.json). The importer turns it into an Assessment (MODULE_TEST / FINAL_EXAM)
// with Questions, so tests use the existing quiz engine: timer, attempts, grading, gradebook, certificates.
// A section is one exam part ("Hören, Teil 2"): what the paper prints or plays once for the whole part
// (instructions, a reading text, one recording) is stored on Assessment.sections and shown above its questions.
import { z } from "zod";
import { scriptProblems } from "./script.js";

const text = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();
/** What the student hears: plain German (one voice) or a conversation of "M: …" / "F: …" lines (script.ts). */
const script = text.superRefine((value, context) => {
  for (const message of scriptProblems(value)) context.addIssue({ code: "custom", message });
});

/**
 * `listen`: the recording of this question (Goethe Hören Teil 1/3: one short text per question).
 * Objective questions are worth 1 point; `write` questions are teacher-graded and carry `points`.
 */
const choose = z.object({ type: z.literal("choose"), prompt: text, options: z.array(text).min(2).max(10), answer: text, listen: script.optional(), explanation: optionalText });
const trueFalse = z.object({ type: z.literal("truefalse"), statement: text, answer: z.boolean(), listen: script.optional(), explanation: optionalText });
const fill = z.object({
  type: z.literal("fill"), prompt: text.refine((value) => value.split("___").length === 2, "fill prompt needs exactly one ___"),
  answer: text.refine((value) => !/\s/.test(value), "fill answers are one word (tests grade exact matches)"), explanation: optionalText,
});
const order = z.object({ type: z.literal("order"), answer: text, en: text });
const match = z.object({ type: z.literal("match"), prompt: text, pairs: z.array(z.tuple([text, text])).min(3).max(6) });
const write = z.object({ type: z.literal("write"), prompt: text, promptEn: text, points: z.number().int().min(2).max(20), modelAnswer: text });

export const testQuestion = z.discriminatedUnion("type", [choose, trueFalse, fill, order, match, write]);

export const testSection = z.object({
  skill: z.enum(["LISTENING", "READING", "VOCABULARY", "GRAMMAR", "WRITING"]),
  title: text,
  titleEn: text,
  /** Instruction shown at the top of the section (German · English). */
  intro: text,
  /** Reading text shown once above the section's questions (an email, the ads a–f, a store guide). */
  passage: optionalText,
  /** One recording for the whole section, e.g. a conversation or interview all its questions are about. */
  listen: script.optional(),
  /** How often each recording of the section may be played (Goethe: once or twice); unlimited when absent. */
  plays: z.number().int().min(1).max(3).optional(),
  /** Exam style: options keep their written order and are labelled a, b, c… like the answer sheet. */
  letters: z.boolean().optional(),
  questions: z.array(testQuestion).min(1),
});

export const testPack = z.object({
  level: text,
  kind: z.enum(["module", "final"]),
  /** Module number for module tests (the test opens after its last lesson). */
  module: z.number().int().positive().optional(),
  title: text,
  titleEn: text,
  description: text,
  descriptionEn: text,
  durationMinutes: z.number().int().min(5).max(180),
  passMark: z.number().min(1).max(100).default(60),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  /** Lesson number the student must have completed before the test opens. */
  after: z.number().int().positive(),
  sections: z.array(testSection).min(1),
}).refine((pack) => pack.kind === "final" || pack.module !== undefined, "module tests need `module`");

export type TestPack = z.infer<typeof testPack>;
export type TestQuestion = z.infer<typeof testQuestion>;
export type TestSection = z.infer<typeof testSection>;
