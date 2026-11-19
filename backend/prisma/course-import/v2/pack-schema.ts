// Course v2 lesson pack: one self-contained JSON file per lesson (packs/<level>/lesson-NN.json),
// German with English help everywhere. The importer turns it into Lesson.content (the student
// lesson view) and PRACTICE activities (Duolingo-style sessions). See v2/README.md.
import { z } from "zod";

const text = z.string().trim().min(1);
const optionalText = z.string().trim().min(1).optional();

/** A German sentence or phrase with its English meaning. */
export const deEn = z.object({ de: text, en: text });

const itemBase = { id: optionalText };

/**
 * Pick the right option. `prompt` is German (gets audio), `promptEn` is an English question or meaning;
 * give at least one. `optionsLang` says whether the options are German (default) or English.
 * `listen: true` plays the German prompt and hides its text until the answer is checked.
 */
const choose = z.object({
  ...itemBase, kind: z.literal("choose"), prompt: optionalText, promptEn: optionalText, listen: z.boolean().optional(),
  options: z.array(text).min(2).max(4), optionsLang: z.enum(["de", "en"]).default("de"), answer: text, explanationEn: optionalText,
}).refine((item) => item.prompt || item.promptEn, "choose needs prompt or promptEn")
  .refine((item) => !item.listen || item.prompt, "listen needs a German prompt");
/** Tap the pairs: German ↔ English. */
const match = z.object({ ...itemBase, kind: z.literal("match"), pairs: z.array(z.tuple([text, text])).min(3).max(6) });
/** Translate a sentence with word tiles (or the keyboard). `accepted` lists other correct answers. */
const translate = z.object({
  ...itemBase, kind: z.literal("translate"), from: z.enum(["de", "en"]), text, answer: text,
  accepted: z.array(text).optional(), distractors: z.array(text).optional(), explanationEn: optionalText,
});
/** Build the German sentence from shuffled words. */
const order = z.object({ ...itemBase, kind: z.literal("order"), answer: text, en: text, distractors: z.array(text).optional() });
/** Complete the gap (`___` once in `text`); with `options` the student picks instead of typing. */
const fill = z.object({
  ...itemBase, kind: z.literal("fill"), text: text.refine((value) => value.split("___").length === 2, "fill text needs exactly one ___"),
  answer: text, accepted: z.array(text).optional(), options: z.array(text).min(2).max(4).optional(),
  en: text, hintEn: optionalText, explanationEn: optionalText,
});
/** Hear a sentence, then pick what was said (`choose`) or type it (`type`, dictation). */
const listen = z.object({
  ...itemBase, kind: z.literal("listen"), text, en: text, mode: z.enum(["choose", "type"]), options: z.array(text).min(2).max(4).optional(),
});
/** Say the sentence aloud (speech recognition where the browser supports it). */
const speak = z.object({ ...itemBase, kind: z.literal("speak"), text, en: text });
/** Richtig oder falsch? About the session passage (reading text or dialogue). */
const trueFalse = z.object({
  ...itemBase, kind: z.literal("truefalse"), statement: text, statementEn: text, answer: z.boolean(), explanationEn: optionalText,
});

export const practiceItem = z.discriminatedUnion("kind", [choose, match, translate, order, fill, listen, speak, trueFalse]);

export const SESSION_KEYS = ["words", "grammar", "listen", "read", "translate"] as const;
export const session = z.object({
  key: z.enum(SESSION_KEYS),
  title: text,
  titleEn: text,
  /** Show the lesson's reading text or play its dialogue before the questions. */
  passage: z.enum(["reading", "dialogue"]).optional(),
  items: z.array(practiceItem).min(4),
});

const grammarTopic = z.object({
  title: text, titleEn: text, explanation: text, explanationEn: text,
  table: z.object({ head: z.array(z.string()), rows: z.array(z.array(z.string())).min(1) }).optional(),
  examples: z.array(z.object({ de: text, en: text, note: optionalText, noteEn: optionalText })),
  tip: optionalText, tipEn: optionalText,
});

export const lessonPack = z.object({
  level: text,
  lesson: z.number().int().positive(),
  title: text,
  titleEn: text,
  summary: text,
  summaryEn: text,
  /** Exam part(s) the lesson prepares for, e.g. "Goethe-Zertifikat A1: Start Deutsch 1 · Sprechen Teil 1". */
  exam: optionalText,
  goals: z.array(deEn).min(1),
  vocab: z.array(z.object({
    de: text, en: text, example: text, exampleEn: text,
    /** What the voice says when the display form is not speakable ("der Name, -n" → "der Name"). */
    say: optionalText, noteEn: optionalText,
  })).min(4),
  grammar: z.array(grammarTopic),
  phrases: z.array(z.object({ function: text, functionEn: text, items: z.array(deEn).min(1) })),
  pronunciation: z.object({
    focus: text, focusEn: text, explanation: text, explanationEn: text,
    examples: z.array(z.object({ de: text, en: text, say: optionalText })).min(1),
  }).optional(),
  dialogue: z.object({
    title: text, titleEn: text,
    /** Voice per speaker: "m" or "f". */
    speakers: z.record(z.string(), z.enum(["m", "f"])),
    lines: z.array(z.object({ speaker: text, de: text, en: text, say: optionalText })).min(2),
  }).optional(),
  reading: z.object({ title: text, titleEn: text, paragraphs: z.array(z.array(deEn).min(1)).min(1) }).optional(),
  /** Lesson-specific tap-to-translate entries; the level glossary (packs/<level>/glossary.json) covers the rest. */
  glossary: z.record(z.string(), z.tuple([text]).or(z.tuple([text, text]))).default({}),
  sessions: z.array(session).min(1),
  writing: z.object({
    task: text, taskEn: text, wordRange: text, checklist: z.array(deEn).min(1), modelAnswer: text, modelAnswerEn: text,
  }).optional(),
  speaking: z.object({
    task: text, taskEn: text, prompts: z.array(deEn).min(1), modelAnswer: text, modelAnswerEn: text,
  }).optional(),
});

/** Level glossary: German form → [English meaning] or [English meaning, dictionary form]. */
export const levelGlossary = z.record(z.string(), z.tuple([text]).or(z.tuple([text, text])));

export type LessonPack = z.infer<typeof lessonPack>;
export type PracticeItem = z.infer<typeof practiceItem>;
export type PracticeSession = z.infer<typeof session>;
export type Glossary = z.infer<typeof levelGlossary>;
