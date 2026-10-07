export type MyAttempt = {
  id: string;
  attemptNumber: number;
  status: string;
  score: number | null;
  maxScore: number;
  passed: boolean | null;
  submittedAt: string | null;
  startedAt: string;
  assessment: { id: string; title: string };
};
