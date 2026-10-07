import type { Money } from './money';
export type StaffAttempt = {
  id: string;
  status: string;
  attemptNumber: number;
  score: number | null;
  maxScore: number;
  passed: boolean | null;
  feedback: string | null;
  submittedAt: string | null;
  student: { id: string; studentCode: string; name: string };
  assessment: { id: string; title: string; type: string; passMark: Money };
  answers: {
    id: string;
    questionId: string;
    prompt: string;
    type: string;
    maxPoints: number;
    response: unknown;
    isCorrect: boolean | null;
    pointsAwarded: number;
    feedback: string | null;
  }[];
};
