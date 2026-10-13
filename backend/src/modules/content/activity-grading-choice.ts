import type { GradeResult } from "./activity-grading-utils.js";
import { fromResults,MANUAL,normalizeAnswer,parseJsonResponse,responseParts } from "./activity-grading-utils.js";
import type { ActivityConfig } from "./activity-keys.js";
import { asIndex,choiceQuestions } from "./activity-keys.js";

/** MCQ: the response is the original (unshuffled) index of the chosen option. */
export function gradeSingleChoice(response: unknown, config: ActivityConfig): GradeResult {
  const expected = asIndex(config.correctIndex ?? config.answer);
  if (expected === null) return MANUAL;
  return fromResults([asIndex(response) === expected]);
}

/** MULTIPLE_SELECT: all-or-nothing on the set of chosen option indices. */
export function gradeMultipleSelect(response: unknown, config: ActivityConfig): GradeResult {
  const expected = config.correctIndices ?? config.answer;
  if (!Array.isArray(expected)) return MANUAL;
  const parsed = parseJsonResponse(response);
  const given: unknown[] = Array.isArray(parsed) ? parsed : [];
  const key = new Set(expected.map(asIndex));
  const chosen = new Set(given.map(asIndex));
  const ok = key.size === chosen.size && [...key].every((index) => index !== null && chosen.has(index));
  return fromResults([ok]);
}

export function gradeTrueFalse(response: unknown, config: ActivityConfig): GradeResult {
  const expected = config.correct ?? config.answer;
  if (expected === undefined || expected === null) return MANUAL;
  return fromResults([normalizeAnswer(response) !== "" && normalizeAnswer(response) === normalizeAnswer(expected)]);
}

/** LISTENING / READING: one chosen index per question, with partial credit. */
export function gradeQuestionSet(response: unknown, config: ActivityConfig): GradeResult {
  const questions = choiceQuestions(config);
  if (questions.length === 0 || questions.some((question) => question.correctIndex === null)) return MANUAL;
  const given = responseParts(response, questions.length);
  return fromResults(questions.map((question, index) => asIndex(given[index]) === question.correctIndex));
}
