import { apiPost } from '.././api';
import type { LessonMaterial } from './lesson-material';
export function createMaterial(
  lessonId: string,
  body: Record<string, unknown>,
): Promise<LessonMaterial> {
  return apiPost<LessonMaterial>(`/content/lessons/${lessonId}/materials`, body);
}
