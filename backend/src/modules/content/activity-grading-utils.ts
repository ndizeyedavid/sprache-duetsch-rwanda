import { asConfig,asText } from "./activity-keys.js";

export type GradeResult = { isCorrect: boolean | null; score: number | null; auto: boolean; results?: boolean[] };

export const MANUAL: GradeResult = { isCorrect: null, score: null, auto: false };

/** Self-study (flashcards, vocabulary): submitting marks it done, with no right or wrong. */
export const COMPLETED: GradeResult = { isCorrect: null, score: 1, auto: true };

/** Case-insensitive, whitespace-collapsed comparison that keeps umlauts and ß distinct. */
export const normalizeAnswer = (value: unknown): string =>
  asText(value).trim().replace(/\s+/g, " ").toLocaleLowerCase("de");

/** Partial credit: score is the share of correct parts (two decimals), correct only when all are. */
export function fromResults(results: boolean[]): GradeResult {
  if (results.length === 0) return MANUAL;
  const correct = results.filter(Boolean).length;
  return { isCorrect: correct === results.length, score: Math.round((correct / results.length) * 100) / 100, auto: true, results };
}

/** Answers sent as JSON text (the assignment page keeps drafts as strings). */
export function parseJsonResponse(response: unknown): unknown {
  if (typeof response !== "string" || !/^\s*[[{]/.test(response)) return response;
  try { return JSON.parse(response) as unknown; } catch { return response; }
}

/**
 * Read a multi-part response as one entry per part. Accepts an aligned array,
 * an object keyed by part index or label, a newline-separated string, or a
 * bare value when there is a single part.
 */
export function responseParts(response: unknown, count: number, labels: string[] = []): unknown[] {
  const parsed = parseJsonResponse(response);
  if (parsed !== response) return responseParts(parsed, count, labels);
  if (Array.isArray(response)) {
    const list: unknown[] = response;
    return Array.from({ length: count }, (_, index) => list[index]);
  }
  if (response && typeof response === "object") {
    const record = asConfig(response);
    return Array.from({ length: count }, (_, index) => record[String(index)] ?? (labels[index] !== undefined ? record[labels[index]] : undefined));
  }
  if (typeof response === "string" && count > 1) return Array.from({ length: count }, (_, index) => response.split(/\r?\n/)[index]);
  return Array.from({ length: count }, (_, index) => (index === 0 ? response : undefined));
}
