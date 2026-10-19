export type MyLesson = {
  id: string;
  title: string;
  description: string | null;
  order: number;
  contentType: string;
  estimatedMinutes: number | null;
  progressStatus: string;
  secondsWatched: number | null;
  completedAt: string | null;
  /** Lesson lead photo for the course map (null when the lesson has none). */
  coverUrl?: string | null;
};
