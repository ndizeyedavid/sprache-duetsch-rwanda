import type { ActivitySubmission } from './activity-submission';
export type LessonActivity = {
  id: string;
  title: string;
  type: string;
  instructions: string | null;
  order: number;
  isPublished: boolean;
  config: unknown;
  mySubmission?: ActivitySubmission | null;
};
