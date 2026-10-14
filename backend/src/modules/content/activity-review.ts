import { gradeActivity } from "./activity-grading.js";
import type { ActivityConfig } from "./activity-keys.js";
import { asConfig,asIndex,asText,blankKeys,choiceQuestions,matchingPairs,orderingKey } from "./activity-keys.js";

export type ActivityReview = Record<string, unknown> & { results: boolean[] | null };

/** Answer keys for one activity type, in the canonical shape the student player expects. */
function answerKeys(type: string, config: ActivityConfig): Record<string, unknown> {
  switch (type) {
    case "MCQ": return { correctIndex: asIndex(config.correctIndex ?? config.answer) };
    case "MULTIPLE_SELECT": {
      const expected = config.correctIndices ?? config.answer;
      return { correctIndices: Array.isArray(expected) ? expected.map(asIndex).filter((index) => index !== null) : null };
    }
    case "TRUE_FALSE": {
      const expected = config.correct ?? config.answer;
      return { correct: typeof expected === "boolean" ? expected : expected === undefined ? null : asText(expected).trim().toLowerCase() === "true" };
    }
    case "LISTENING":
    case "READING": return { correctIndices: choiceQuestions(config).map((question) => question.correctIndex) };
    case "FILL_BLANK": return { blanks: blankKeys(config) };
    case "MATCHING": return { pairs: matchingPairs(config) };
    case "ORDERING": return { order: orderingKey(config) };
    default: return {};
  }
}

/**
 * Feedback revealed to a student only after they submit: correct answers,
 * per-part results, and post-submission material (transcript, model answer,
 * explanation). Structured self-study uses `practiceFeedback` instead.
 */
export function buildActivityReview(type: string, configValue: unknown, response: unknown): ActivityReview | null {
  const config = asConfig(configValue);
  if (config.practiceMode === true) return null;
  const revealed: Record<string, unknown> = {};
  for (const key of ["transcript", "modelAnswer", "explanation"]) {
    const value = config[key];
    if (typeof value === "string" && value.trim()) revealed[key] = value;
  }
  return { ...revealed, ...answerKeys(type, config), results: gradeActivity(type, response, config).results ?? null };
}

/** Attach review (or legacy practice feedback) to a student's own submission. */
export function presentSubmission<T extends { response: unknown }>(submission: T, activity: { type: string; config: unknown }) {
  const config = asConfig(activity.config);
  if (config.practiceMode === true) return { ...submission, practiceFeedback: activity.config };
  return { ...submission, review: buildActivityReview(activity.type, config, submission.response) };
}
