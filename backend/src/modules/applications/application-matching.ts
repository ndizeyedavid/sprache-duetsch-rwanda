import type { Shift } from "../../generated/prisma/client.js";

export interface MatchableLevel {
  id: string;
  code: string;
  title: string;
}

const normalise = (value: string): string => value.toLowerCase().replace(/\s+/g, " ").trim();
const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Codes are matched as whole tokens; "-" counts as part of a token so "B1" never matches "B1-BERUF".
const hasToken = (text: string, token: string): boolean =>
  new RegExp(`(^|[^a-z0-9-])${escapeRegex(token)}($|[^a-z0-9-])`).test(text);

/**
 * Map the free-text course an external site sends (e.g. "German A1 (Beginner)") to a level.
 * Exact code/title wins, then a contained title, then the longest whole-token code.
 */
export function matchLevel<T extends MatchableLevel>(course: string | null | undefined, levels: T[]): T | null {
  const text = normalise(course ?? "");
  if (!text) return null;
  const exact = levels.find((level) => normalise(level.code) === text || normalise(level.title) === text);
  if (exact) return exact;
  const byTitle = levels
    .filter((level) => text.includes(normalise(level.title)))
    .sort((a, b) => b.title.length - a.title.length)[0];
  if (byTitle) return byTitle;
  const byCode = levels
    .filter((level) => hasToken(text, normalise(level.code)))
    .sort((a, b) => b.code.length - a.code.length)[0];
  return byCode ?? null;
}

const SHIFT_WORDS: [Shift, RegExp][] = [
  ["WEEKEND", /weekend|saturday|sunday/],
  ["MORNING", /morning|\bam\b/],
  ["AFTERNOON", /afternoon/],
  ["EVENING", /evening|night|\bpm\b/],
];

/** Best-effort shift from a free-text schedule such as "Evening (17:30 – 19:30)". */
export function matchShift(schedule: string | null | undefined): Shift | null {
  const text = normalise(schedule ?? "");
  if (!text) return null;
  return SHIFT_WORDS.find(([, pattern]) => pattern.test(text))?.[0] ?? null;
}
