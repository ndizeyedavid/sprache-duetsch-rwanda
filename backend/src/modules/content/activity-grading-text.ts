import type { GradeResult } from "./activity-grading-utils.js";
import { fromResults,MANUAL,normalizeAnswer,parseJsonResponse,responseParts } from "./activity-grading-utils.js";
import type { ActivityConfig } from "./activity-keys.js";
import { blankKeys,matchingPairs,orderingKey } from "./activity-keys.js";

/** FILL_BLANK: each blank accepts any listed alternative; partial credit across blanks. */
export function gradeBlanks(response: unknown, config: ActivityConfig): GradeResult {
  const keys = blankKeys(config);
  if (!keys) return MANUAL;
  const given = responseParts(response, keys.length).map(normalizeAnswer);
  return fromResults(keys.map((alternatives, index) => alternatives.some((answer) => normalizeAnswer(answer) === given[index])));
}

/** MATCHING: the response names the chosen right-hand side for each left item. */
export function gradeMatching(response: unknown, config: ActivityConfig): GradeResult {
  const pairs = matchingPairs(config);
  if (pairs.length === 0) return MANUAL;
  const given = responseParts(response, pairs.length, pairs.map((pair) => pair.left)).map(normalizeAnswer);
  return fromResults(pairs.map((pair, index) => given[index] !== "" && given[index] === normalizeAnswer(pair.right)));
}

/** ORDERING: positional partial credit; fully correct only when the whole sequence matches. */
export function gradeOrdering(response: unknown, config: ActivityConfig): GradeResult {
  const key = orderingKey(config);
  if (!key) return MANUAL;
  const parsed = parseJsonResponse(response);
  const given = Array.isArray(parsed) ? parsed : [];
  const graded = fromResults(key.map((item, index) => normalizeAnswer(given[index]) === normalizeAnswer(item)));
  return given.length === key.length ? graded : { ...graded, isCorrect: false };
}
