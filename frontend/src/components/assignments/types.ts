export type AssignmentDetailData = {
  source: string;
  activity?: { id: string; title: string; type: string; instructions: string | null; config: unknown; lessonId: string };
  submission?: { status: string; score: number | null; feedback: string | null } | null;
  lesson?: { id: string; title: string; module: { title: string; level: { code: string; title: string } } };
  level?: { code: string; title: string };
  assessment?: { protectedMode?: boolean; id: string; title: string; description: string | null; type: string; durationMinutes: number | null; passMark: unknown; availableUntil: string | null; maxAttempts?: number | null; _count?: { questions: number } };
  attempts?: { status: string; score?: number | string | null; maxScore?: number | string; passed?: boolean; feedback?: string | null }[];
};

export type QuizResult = { status: string; score: number | null; maxScore: number | null; percentage: number | null; passed: boolean; feedback?: string | null };
