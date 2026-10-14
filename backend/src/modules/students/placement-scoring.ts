import type { QuestionType } from "../../generated/prisma/client.js";
import { gradeObjectiveAnswer } from "../assessments/grade-objective-answer.js";
import { isObjectiveQuestionType } from "../assessments/is-objective-question-type.js";

export interface ScorableQuestion {
  id: string;
  type: QuestionType;
  correctAnswer: unknown;
  points: number;
}

export interface GradedPlacementAnswer {
  questionId: string;
  response: unknown;
  isCorrect: boolean | null;
  pointsAwarded: number;
}

/**
 * Auto-grade a placement attempt. Only objective questions count towards the
 * percentage; anything else is stored ungraded so a misconfigured test cannot
 * silently drag every score down.
 */
export const scorePlacement = (questions: ScorableQuestion[], responses: Record<string, unknown>) => {
  let score = 0;
  let maxScore = 0;
  const answers: GradedPlacementAnswer[] = [];
  for (const question of questions) {
    const objective = isObjectiveQuestionType(question.type);
    if (objective) maxScore += question.points;
    if (!(question.id in responses)) continue;
    const response = responses[question.id];
    const isCorrect = objective ? gradeObjectiveAnswer(question.type, response, question.correctAnswer) : null;
    const pointsAwarded = isCorrect ? question.points : 0;
    score += pointsAwarded;
    answers.push({ questionId: question.id, response, isCorrect, pointsAwarded });
  }
  const percentage = maxScore > 0 ? Math.min(100, Math.max(0, Math.round((score / maxScore) * 100))) : 0;
  return { score, maxScore, percentage, answers };
};
