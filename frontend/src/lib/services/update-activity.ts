import { apiPatch } from '.././api';
import type { LessonActivity } from './lesson-activity';
export function updateActivity(id: string, body: Record<string, unknown>): Promise<LessonActivity> {
  return apiPatch<LessonActivity>(`/content/activities/${id}`, body);
}
