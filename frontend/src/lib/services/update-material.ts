import { apiPatch } from '.././api';
import type { LessonMaterial } from './lesson-material';
export function updateMaterial(id: string, body: Record<string, unknown>): Promise<LessonMaterial> {
  return apiPatch<LessonMaterial>(`/content/materials/${id}`, body);
}
