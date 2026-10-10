import { apiGet } from '.././api';
import type { LessonMaterial } from './lesson-material';
export function getMyNotes(): Promise<LessonMaterial[]> {
  return apiGet<LessonMaterial[]>('/content/my/notes?pageSize=50');
}
