import type { Money } from './money';
export type MyAssessmentDetail = {
  protectedMode: boolean;
  id: string;
  title: string;
  description: string | null;
  type: string;
  durationMinutes: number | null;
  maxAttempts: number | null;
  passMark: number | null;
  availableUntil: string | null;
  availableFrom: string | null;
  questions: {
    id: string;
    order: number;
    points: Money | null;
    question: {
      id: string;
      type: string;
      skill: string;
      difficulty: string;
      prompt: string;
      options: unknown;
      imageUrl: string | null;
      audioUrl: string | null;
      points: Money;
    };
  }[];
  attemptCount: number;
};
