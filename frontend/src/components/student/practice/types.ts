export type Item = { id: string; prompt: string; options?: string[]; answer?: string };
export type Config = { autoGraded?: boolean; practiceMode?: boolean; options?: string[]; items?: Item[]; instruction?: string; modelAnswer?: string | null; explanation?: string };
export type Activity = { id: string; title: string; type: string; instructions: string | null; config?: unknown;
  mySubmission?: { isCorrect: boolean | null; status: string; response?: unknown; practiceFeedback?: unknown } | null };
export type Answer = string | number | Record<string, string>;
