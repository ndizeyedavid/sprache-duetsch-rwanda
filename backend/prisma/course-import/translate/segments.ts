// What students read in an HTML ("body") lesson and its activities, in the pieces the lesson page shows:
// one entry per innermost block (paragraph, list item, table cell, heading…), whitespace collapsed.
// The student view (frontend components/learn/translate/annotate-html.ts) finds the English by the same
// text, so BLOCK and normalizeText must stay identical there.
import { DOMParser } from "linkedom";
import { tokenize } from "../v2/tokens.js";

export const BLOCK = "p,li,td,th,h1,h2,h3,h4,h5,h6,dt,dd,caption,figcaption,blockquote";

export const normalizeText = (text: string): string => text.replace(/\s+/g, " ").trim();

/** Worth translating: has a word of two letters or more and is not a bare link. */
export const translatable = (text: string): boolean => /\p{L}{2,}/u.test(text) && !/^https?:\/\/\S+$/.test(text);

/** The part of a parsed element this module reads (linkedom ships loose types; the backend has no DOM lib). */
type BlockElement = { querySelector(selector: string): unknown; textContent: string | null };

export function lessonBlocks(html: string | null): string[] {
  if (!html) return [];
  const document = new DOMParser().parseFromString(`<!doctype html><html><body>${html}</body></html>`, "text/html");
  const elements = Array.from(document.querySelectorAll(BLOCK) as Iterable<BlockElement>);
  return elements
    .filter((element) => !element.querySelector(BLOCK))
    .map((element) => normalizeText(element.textContent ?? ""))
    .filter(translatable);
}

/** Activity text a student sees before answering, and text only revealed afterwards (it can give answers away). */
const PUBLIC_KEYS = new Set(["instruction", "instructions", "prompt", "question", "passage", "example", "task", "hint"]);
export const HIDDEN_KEYS = new Set(["explanation", "modelAnswer", "sampleAnswer", "transcript"]);

export type ActivityTexts = { visible: string[]; hidden: string[] };

export function activityTexts(activity: { instructions: string | null; config: unknown }): ActivityTexts {
  const visible: string[] = activity.instructions ? [normalizeText(activity.instructions)] : [];
  const hidden: string[] = [];
  const walk = (value: unknown, key: string | null) => {
    if (typeof value === "string") {
      if (key && PUBLIC_KEYS.has(key)) visible.push(normalizeText(value));
      if (key && HIDDEN_KEYS.has(key)) hidden.push(normalizeText(value));
      return;
    }
    if (Array.isArray(value)) for (const item of value) walk(item, key === "items" || key === "cards" || key === "questions" ? null : key);
    else if (value && typeof value === "object") for (const [child, inner] of Object.entries(value)) walk(inner, child);
  };
  walk(activity.config, null);
  return { visible: [...new Set(visible.filter(translatable))], hidden: [...new Set(hidden.filter(translatable))] };
}

/** Distinct word forms of some German texts, in order of appearance, with the first text each appears in. */
export function wordForms(texts: string[]): Map<string, string> {
  const forms = new Map<string, string>();
  for (const text of texts) {
    for (const token of tokenize(text)) if (token.word && !forms.has(token.text)) forms.set(token.text, text);
  }
  return forms;
}
