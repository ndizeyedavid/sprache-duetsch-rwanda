// Course v2 shapes. KEEP IN SYNC with backend/prisma/course-import/v2/content-types.ts.
/** [English], [English, dictionary form], or in built lesson content [English, dictionary form or "", recording URL]. */
export type Entry = [string] | [string, string] | [string, string, string];
export type Glossary = Record<string, Entry>;
export type Line = { de: string; en: string; audio?: string };

/** A word-list entry: dictionary form, English, example and its English, audio clips. */
export type VocabWord = { de: string; en: string; example?: string | null; exampleEn?: string | null; audio?: string | null; exampleAudio?: string | null };

/**
 * Lesson.translation of an HTML ("body") lesson (backend prisma/course-import/translate): English per text
 * block and activity prompt, tap-to-translate meanings and the lesson's word list.
 */
export type LessonTranslation = { v: 1; lines: Record<string, string>; glossary: Glossary; words: VocabWord[] };

/** Lesson.content: the structured lesson a student reads before practising. */
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
  dialogue?: { title: string; titleEn: string; lines: (Line & { speaker: string; voice: 'm' | 'f' })[] };
  reading?: { title: string; titleEn: string; paragraphs: Line[][] };
  glossary: Glossary;
};

export type ChooseItem = { id: string; kind: 'choose'; prompt?: string; promptEn?: string; listen?: boolean; options: string[]; optionsLang: 'de' | 'en'; answer: string; explanationEn?: string; audio?: string; answerAudio?: string };
export type MatchItem = { id: string; kind: 'match'; pairs: [string, string][]; pairAudio: (string | null)[] };
export type TranslateItem = { id: string; kind: 'translate'; from: 'de' | 'en'; text: string; answer: string; accepted: string[]; tiles: string[]; explanationEn?: string; audio?: string; answerAudio?: string };
export type OrderItem = { id: string; kind: 'order'; answer: string; en: string; tiles: string[]; answerAudio?: string };
export type FillItem = { id: string; kind: 'fill'; text: string; answer: string; accepted: string[]; options?: string[]; en: string; hintEn?: string; explanationEn?: string; answerAudio?: string };
export type ListenItem = { id: string; kind: 'listen'; text: string; en: string; mode: 'choose' | 'type'; options?: string[]; audio?: string };
export type SpeakItem = { id: string; kind: 'speak'; text: string; en: string; audio?: string };
export type TrueFalseItem = { id: string; kind: 'truefalse'; statement: string; statementEn: string; answer: boolean; explanationEn?: string; audio?: string };
export type SessionItem = ChooseItem | MatchItem | TranslateItem | OrderItem | FillItem | ListenItem | SpeakItem | TrueFalseItem;

/** Activity.config of a PRACTICE activity (answer keys included: practice is checked in the browser). */
export type SessionConfig = {
  v: 2;
  session: 'words' | 'grammar' | 'listen' | 'read' | 'translate' | 'review';
  titleEn: string;
  passage?: 'reading' | 'dialogue';
  items: SessionItem[];
};

export const isLessonContent = (value: unknown): value is LessonContent =>
  !!value && typeof value === 'object' && (value as { v?: unknown }).v === 2 && Array.isArray((value as { vocab?: unknown }).vocab);

export const isSessionConfig = (value: unknown): value is SessionConfig =>
  !!value && typeof value === 'object' && (value as { v?: unknown }).v === 2 && Array.isArray((value as { items?: unknown }).items);
