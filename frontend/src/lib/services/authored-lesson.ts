import type { LessonActivity } from './lesson-activity';
import type { LessonMaterial } from './lesson-material';
export type AuthoredLesson = {
  id: string;
  moduleId: string;
  title: string;
  description: string | null;
  order: number;
  contentType: string;
  body: string | null;
  /** Course v2 structured lesson; staff edit `body`, students see this when it is set. */
  content?: unknown;
  videoUrl: string | null;
  audioUrl: string | null;
  estimatedMinutes: number | null;
  isPublished: boolean;
  materials: LessonMaterial[];
  activities: LessonActivity[];
};
