import { apiPatch } from '.././api';
import type { LevelItem } from './level-item';
export function updateLevel(id: string, body: Record<string, unknown>): Promise<LevelItem> {
  return apiPatch<LevelItem>(`/levels/${id}`, body);
}
