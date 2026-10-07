import { apiGet } from '.././api';
import type { LevelItem } from './level-item';
export function getLevel(id: string): Promise<LevelItem> {
  return apiGet<LevelItem>(`/levels/${id}`);
}
