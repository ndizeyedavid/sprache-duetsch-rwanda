import { gradeMultipleSelect,gradeQuestionSet,gradeSingleChoice,gradeTrueFalse } from "./activity-grading-choice.js";
import { gradeBlanks,gradeMatching,gradeOrdering } from "./activity-grading-text.js";
import type { GradeResult } from "./activity-grading-utils.js";
import { COMPLETED,MANUAL } from "./activity-grading-utils.js";
import { gradeStructured } from "./structured-grading.js";

export type { GradeResult } from "./activity-grading-utils.js";

/** Activity types a student completes by working through them, with no right or wrong. */
export const COMPLETION_TYPES = new Set(["VOCABULARY", "FLASHCARD"]);

/**
 * Auto-grade a lesson activity response. Returns `auto: false` (manual grading)
 * for open tasks and whenever the config carries no usable answer key.
 */
export function gradeActivity(type: string, response: unknown, config: Record<string, unknown>): GradeResult {
  // Structured self-study (course imports) keeps its own per-item grader.
  if (config.practiceMode === true && Array.isArray(config.items)) return gradeStructured(response, config.items);
  switch (type) {
    case "MCQ": return gradeSingleChoice(response, config);
    case "MULTIPLE_SELECT": return gradeMultipleSelect(response, config);
    case "TRUE_FALSE": return gradeTrueFalse(response, config);
    case "LISTENING":
    case "READING": return gradeQuestionSet(response, config);
    case "FILL_BLANK": return gradeBlanks(response, config);
    case "MATCHING": return gradeMatching(response, config);
    case "ORDERING": return gradeOrdering(response, config);
    case "VOCABULARY":
    case "FLASHCARD": return COMPLETED;
    // WRITING (incl. document submissions), SPEAKING, PRONUNCIATION: teacher grades.
    default: return MANUAL;
  }
}
