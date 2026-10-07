import { apiPost } from '.././api';
import type { LessonActivity } from './lesson-activity';
export function createActivity(
  lessonId: string,
  body: Record<string, unknown>,
): Promise<LessonActivity> {
  return apiPost<LessonActivity>(`/content/lessons/${lessonId}/activities`, body);
}
