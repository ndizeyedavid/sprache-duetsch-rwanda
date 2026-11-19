import type { Money } from './money';

/** One exam part (Assessment.sections): instructions, reading text and recording shown once above its questions. */
export type AssessmentSection = {
  title: string;
  intro?: string | null;
  passage?: string | null;
  audioUrl?: string | null;
  /** Plays allowed per recording of the part ("Sie hören den Text zweimal"); unlimited when absent. */
  plays?: number | null;
  /** Options keep their order and are labelled a, b, c like the exam answer sheet. */
  letters?: boolean;
  skill?: string;
  questionIds: string[];
};

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
  /** Exam parts; empty for tests without sections (shown as one list). */
  sections?: AssessmentSection[];
  attemptCount: number;
};
