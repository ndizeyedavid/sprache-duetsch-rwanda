import type { Money } from './money';
export type AuthoredAssessment = {
  protectedMode: boolean;
  availableFrom: string | null;
  availableUntil: string | null;
  id: string;
  levelId: string;
  title: string;
  description: string | null;
  type: string;
  durationMinutes: number | null;
  maxAttempts: number | null;
  passMark: Money;
  isPublished: boolean;
  questions?: { questionId: string; order: number; points?: string | null; question?: import('./question-item').QuestionItem }[];
};
