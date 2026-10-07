import type { Money } from './money';
export type QuestionItem = {
  id: string;
  levelId: string;
  moduleId: string | null;
  type: string;
  skill: string;
  difficulty: string;
  prompt: string;
  points: Money;
  options?: unknown;
  correctAnswer?: unknown;
  explanation?: string | null;
  audioUrl?: string | null;
  imageUrl?: string | null;
};
