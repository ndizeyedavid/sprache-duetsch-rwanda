import { apiPost } from '.././api';
import type { LevelItem } from './level-item';
export function createLevel(body: Record<string, unknown>): Promise<LevelItem> {
  return apiPost<LevelItem>('/levels', body);
}
