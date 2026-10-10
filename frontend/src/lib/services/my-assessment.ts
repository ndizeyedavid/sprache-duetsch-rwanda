export type MyAssessment = {
  id: string;
  title: string;
  type: string;
  levelId: string;
  level?: { id: string; code: string; title: string; levelLabel: string };
  description: string | null;
  durationMinutes: number | null;
  maxAttempts: number | null;
  passMark: number | null;
  availableFrom: string | null;
  availableUntil: string | null;
  attemptCount: number;
  bestScore: number | null;
  maxScore: number;
  latestStatus: string | null;
  latestSubmittedAt: string | null;
  attempts?: { score: number | null; maxScore: number; status: string; passed: boolean | null; submittedAt: string | null }[];
};
