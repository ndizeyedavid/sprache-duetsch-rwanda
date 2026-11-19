import { asConfig,asText } from "./activity-keys.js";
import type { GradeResult } from "./activity-grading-utils.js";

/**
 * Course v2 practice session (PRACTICE). The browser checks each question as it is answered and
 * sends `{ results: { [itemId]: firstTryCorrect }, seconds }` once every question is done.
 * The score is the share right first time; finishing the session always counts as completed.
 */
export function gradePractice(response: unknown, configValue: unknown): GradeResult {
  const config = asConfig(configValue);
  const ids = (Array.isArray(config.items) ? config.items : []).map((item) => asText(asConfig(item).id)).filter(Boolean);
  if (!ids.length) return { isCorrect: null, score: 1, auto: true };
  const results = asConfig(asConfig(response).results);
  const correct = ids.filter((id) => results[id] === true).length;
  return { isCorrect: true, score: Math.round((correct / ids.length) * 100) / 100, auto: true };
}
