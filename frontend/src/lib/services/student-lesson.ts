import type { LessonTranslation } from '../../components/learn/types';
import type { LessonActivity } from './lesson-activity';
import type { LessonMaterial } from './lesson-material';
import type { LevelItem } from './level-item';
export type StudentLesson = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  body: string | null;
  /** Course v2 structured lesson (components/learn/types.ts LessonContent) when imported. */
  content?: unknown;
  /** English help for an HTML lesson (null for course v2 lessons, which carry it in `content`). */
  translation?: LessonTranslation | null;
  videoUrl: string | null;
  audioUrl: string | null;
  estimatedMinutes: number | null;
  module: { id: string; title: string; levelId: string; level: LevelItem };
  materials: LessonMaterial[];
  activities: LessonActivity[];
  progressStatus: string;
  /** Module tests / final exam that open after this lesson, with the student's latest attempt. */
  tests?: { id: string; title: string; type: string; durationMinutes: number | null; passMark: string | number;
    attempts: { status: string; score: string | number | null; maxScore: string | number; passed: boolean | null }[] }[];
  lockedByPrerequisite: boolean;
};
