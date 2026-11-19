// Shapes stored by the course v2 importer. KEEP IN SYNC with frontend/src/components/learn/types.ts.
// `audio` fields are URLs under /audio/… (see v2/audio.ts).
import type { Entry } from "./tokens.js";

export type Line = { de: string; en: string; audio?: string };

/** Lesson.content — the structured lesson the student reads before practising. */
export type LessonContent = {
  v: 2;
  level: string;
  lesson: number;
  titleEn: string;
  summary: string;
  summaryEn: string;
  exam?: string;
  photo?: { src: string; alt: string };
  goals: Line[];
  vocab: { de: string; en: string; audio?: string; example: string; exampleEn: string; exampleAudio?: string; noteEn?: string }[];
  grammar: {
    title: string; titleEn: string; explanation: string; explanationEn: string;
    table?: { head: string[]; rows: string[][] };
    examples: (Line & { note?: string; noteEn?: string })[];
    tip?: string; tipEn?: string;
  }[];
  phrases: { function: string; functionEn: string; items: Line[] }[];
  pronunciation?: { focus: string; focusEn: string; explanation: string; explanationEn: string; examples: Line[] };
  dialogue?: { title: string; titleEn: string; lines: (Line & { speaker: string; voice: "m" | "f" })[] };
  reading?: { title: string; titleEn: string; paragraphs: Line[][] };
  /** Only the entries this lesson's German text needs (lesson pack entries win over the level glossary). */
  glossary: Record<string, Entry>;
};

type ItemBase = { id: string };
export type SessionItem = ItemBase & (
  | { kind: "choose"; prompt?: string; promptEn?: string; listen?: boolean; options: string[]; optionsLang: "de" | "en"; answer: string; explanationEn?: string; audio?: string; answerAudio?: string }
  | { kind: "match"; pairs: [string, string][]; pairAudio: (string | null)[] }
  | { kind: "translate"; from: "de" | "en"; text: string; answer: string; accepted: string[]; tiles: string[]; explanationEn?: string; audio?: string; answerAudio?: string }
  | { kind: "order"; answer: string; en: string; tiles: string[]; answerAudio?: string }
  | { kind: "fill"; text: string; answer: string; accepted: string[]; options?: string[]; en: string; hintEn?: string; explanationEn?: string; answerAudio?: string }
  | { kind: "listen"; text: string; en: string; mode: "choose" | "type"; options?: string[]; audio?: string }
  | { kind: "speak"; text: string; en: string; audio?: string }
  | { kind: "truefalse"; statement: string; statementEn: string; answer: boolean; explanationEn?: string; audio?: string }
);

/** Activity.config of a PRACTICE activity. Answer keys stay in: practice is self-study, checked in the browser. */
export type SessionConfig = {
  v: 2;
  session: "words" | "grammar" | "listen" | "read" | "translate";
  titleEn: string;
  passage?: "reading" | "dialogue";
  items: SessionItem[];
};
