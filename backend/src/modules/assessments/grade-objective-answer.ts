import type { QuestionType } from "../../generated/prisma/client.js";
import { asList } from './as-list.js';
import { sameSequence } from './same-sequence.js';
import { sameSet } from './same-set.js';
export const gradeObjectiveAnswer = (
  type: QuestionType,
  response: unknown,
  correctAnswer: unknown,
): boolean => {
  const given = asList(response);
  const expected = asList(correctAnswer);
  if (type === "ORDERING") {
    return sameSequence(given, expected);
  }
  return sameSet(given, expected);
};
