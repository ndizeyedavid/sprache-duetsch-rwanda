/**
 * Answer-key readers for lesson activities. Each accepts the canonical config
 * shape plus the legacy keys older content was saved with, so grading, the
 * student sanitizer and post-submission review all agree on one interpretation.
 */
export type ActivityConfig = Record<string, unknown>;
export type ChoiceQuestion = { prompt: string; options: string[]; correctIndex: number | null };
export type MatchingPair = { left: string; right: string };

export const asConfig = (value: unknown): ActivityConfig =>
  value && typeof value === "object" && !Array.isArray(value) ? (value as ActivityConfig) : {};

export const asText = (value: unknown): string =>
  typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : "";

/** A non-negative integer index, or null when the value is not one. */
export const asIndex = (value: unknown): number | null => {
  const parsed = typeof value === "number" ? value : typeof value === "string" && value.trim() !== "" ? Number(value) : NaN;
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
};

const accepted = (value: unknown): string[] =>
  (Array.isArray(value) ? value : [value]).map(asText).filter((answer) => answer.trim() !== "");

/** Accepted alternatives for every blank, in display order; null when any blank lacks a key. */
export function blankKeys(config: ActivityConfig): string[][] | null {
  const rows = Array.isArray(config.sentences) ? config.sentences.map(asConfig) : [config];
  const keys = rows.map((row) => accepted(row.answer ?? row.answers ?? row.correctAnswer));
  return keys.length > 0 && keys.every((key) => key.length > 0) ? keys : null;
}

/** Display sentences for fill-in-the-blank, without their answers. */
export function blankSentences(config: ActivityConfig): string[] {
  if (Array.isArray(config.sentences)) return config.sentences.map((row) => asText(asConfig(row).text));
  return [asText(config.text ?? config.sentence ?? config.prompt)];
}

/** Pairs from `{pairs: [{left, right}]}`, `[[left, right]]` rows, or parallel `left`/`right` arrays. */
export function matchingPairs(config: ActivityConfig): MatchingPair[] {
  if (Array.isArray(config.pairs)) {
    return config.pairs
      .map((row) => (Array.isArray(row) ? { left: asText(row[0]), right: asText(row[1]) } : { left: asText(asConfig(row).left), right: asText(asConfig(row).right) }))
      .filter((pair) => pair.left.trim() !== "" && pair.right.trim() !== "");
  }
  const { left, right } = config;
  if (Array.isArray(left) && Array.isArray(right) && left.length === right.length) {
    return left.map((value, index) => ({ left: asText(value), right: asText(right[index]) }));
  }
  return [];
}

/** The correct sequence: legacy `answer`/`correctAnswer`/`correctOrder` win over canonical `items`. */
export function orderingKey(config: ActivityConfig): string[] | null {
  for (const key of ["answer", "correctAnswer", "correctOrder", "items"]) {
    const value = config[key];
    if (Array.isArray(value) && value.length > 0 && value.every((item) => typeof item === "string" || typeof item === "number")) {
      return value.map(asText);
    }
  }
  return null;
}

/** Comprehension questions (`questions[]`), or the legacy single top-level question. */
export function choiceQuestions(config: ActivityConfig): ChoiceQuestion[] {
  const legacySingle = Array.isArray(config.options) || asIndex(config.correctIndex ?? config.answer) !== null;
  const rows = Array.isArray(config.questions) ? config.questions.map(asConfig) : legacySingle ? [config] : [];
  return rows.map((row) => ({
    prompt: asText(row.prompt ?? row.question),
    options: Array.isArray(row.options) ? row.options.map(asText) : [],
    correctIndex: asIndex(row.correctIndex ?? row.answer),
  }));
}
