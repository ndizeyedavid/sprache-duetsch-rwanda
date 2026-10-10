import type { LessonActivity } from './lesson-activity';
import type { LessonMaterial } from './lesson-material';
import type { LevelItem } from './level-item';
export type StudentLesson = {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  body: string | null;
  videoUrl: string | null;
  audioUrl: string | null;
  estimatedMinutes: number | null;
  module: { id: string; title: string; levelId: string; level: LevelItem };
  materials: LessonMaterial[];
  activities: LessonActivity[];
  progressStatus: string;
  lockedByPrerequisite: boolean;
};
