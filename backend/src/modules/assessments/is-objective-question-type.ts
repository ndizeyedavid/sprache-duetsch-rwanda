import type { QuestionType } from "../../generated/prisma/client.js";
import { OBJECTIVE_TYPES } from './objective_types.js';
export const isObjectiveQuestionType = (type: QuestionType): boolean =>
  OBJECTIVE_TYPES.includes(type);
