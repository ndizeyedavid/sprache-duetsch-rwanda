import { apiGet } from '.././api';
import type { LevelItem } from './level-item';
export function listLevels(): Promise<LevelItem[]> {
  return apiGet<LevelItem[]>('/levels?pageSize=100');
}
