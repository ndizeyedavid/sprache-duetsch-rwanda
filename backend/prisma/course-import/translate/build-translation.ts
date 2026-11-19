// Turns the translation memory into what one HTML lesson stores (Lesson.translation) and what its
// activities carry: English for the lesson page and activity prompts, tap-to-translate meanings, the
// lesson's word list (vocabulary from the course JSON, already in English) and, inside each activity
// config, `explanationEn` / `modelAnswerEn` next to the German they translate (hidden until answered).
import type { AudioCollector } from "../v2/audio.js";
import { spokenHeadword,usableClip,withWordAudio } from "../v2/audio.js";
import type { Entry } from "../v2/tokens.js";
import type { BodyLesson } from "./lessons.js";
import { visibleTexts } from "./lessons.js";
import type { Memory } from "./memory.js";
import { glossed,SAME } from "./memory.js";
import { normalizeText,wordForms } from "./segments.js";

export type LessonTranslation = {
  v: 1;
  lines: Record<string, string>;
  glossary: Record<string, Entry>;
  words: { de: string; en: string; example?: string; exampleEn?: string; audio?: string; exampleAudio?: string }[];
};

const english = (memory: Memory, text: string): string | undefined => {
  const en = memory.lines[normalizeText(text)];
  return en && en !== SAME ? en : undefined;
};

export function buildTranslation(entry: BodyLesson, memory: Memory, audio: AudioCollector) {
  const visible = visibleTexts(entry);
  const lines: Record<string, string> = {};
  const missingLines: string[] = [];
  for (const text of visible) {
    const en = memory.lines[text];
    if (en === undefined) missingLines.push(text);
    else if (en !== SAME) lines[text] = en;
  }
  const glossary: Record<string, Entry> = {};
  const missingForms: string[] = [];
  for (const [form] of wordForms(visible)) {
    if (form.length < 2) continue;
    const found = glossed(memory, form);
    if (!found) missingForms.push(form);
    else if (found[0] !== SAME) glossary[form] = found;
  }
  // The word list: the lesson's vocabulary as printed ("der Beruf, -e — EN: job"), its example in English.
  const words = entry.source.wortschatz.map((word) => {
    const shown = normalizeText(`${word.wort} — EN: ${word.en} · FR: ${word.fr}${word.beispiel}`);
    const exampleEn = english(memory, shown)?.replace(/^Example:\s*/i, "") ?? english(memory, word.beispiel);
    return {
      de: word.wort, en: word.en, example: word.beispiel || undefined, exampleEn,
      audio: usableClip(audio.say(word.wort, "m", spokenHeadword(word.wort))), exampleAudio: audio.say(word.beispiel),
    };
  });
  const translation: LessonTranslation = { v: 1, lines, glossary: withWordAudio(glossary, (form) => audio.say(form)), words };
  return { translation, missingLines, missingForms };
}

/** Activity config with `explanationEn` / `modelAnswerEn` added next to the German (same depth, same secrecy). */
export function withHiddenEnglish(config: unknown, memory: Memory): { config: unknown; missing: string[] } {
  const missing: string[] = [];
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== "object") return value;
    const result: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) result[key] = visit(inner);
    for (const key of ["explanation", "modelAnswer"] as const) {
      const german = result[key];
      if (typeof german !== "string" || !german.trim()) continue;
      const en = english(memory, german);
      if (en) result[`${key}En`] = en;
      else if (memory.lines[normalizeText(german)] === undefined) missing.push(german);
    }
    return result;
  };
  return { config: visit(config), missing };
}
