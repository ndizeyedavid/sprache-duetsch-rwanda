import { apiGet } from '.././api';
import type { AuthoredLesson } from './authored-lesson';
export function getLesson(id: string): Promise<AuthoredLesson> {
  return apiGet<AuthoredLesson>(`/content/lessons/${id}`);
}
