import { apiPatch } from '.././api';
import type { AuthoredLesson } from './authored-lesson';
export function updateLesson(id: string, body: Record<string, unknown>): Promise<AuthoredLesson> {
  return apiPatch<AuthoredLesson>(`/content/lessons/${id}`, body);
}
