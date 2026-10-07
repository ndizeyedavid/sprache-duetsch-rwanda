import { apiPost } from '.././api';
import type { AuthoredLesson } from './authored-lesson';
export function createLesson(
  moduleId: string,
  body: Record<string, unknown>,
): Promise<AuthoredLesson> {
  return apiPost<AuthoredLesson>(`/content/modules/${moduleId}/lessons`, body);
}
