import type { Money } from './money';
export type ActivitySubmission = {
  practiceFeedback?: unknown;
  id: string;
  activityId: string;
  studentId: string;
  response: unknown;
  isCorrect: boolean | null;
  score: Money | null;
  maxScore: Money;
  status: string;
  feedback: string | null;
  attemptNumber: number;
  submittedAt: string;
  gradedAt: string | null;
};
