import { apiGet } from '.././api';
import type { MyProgressLevel } from './my-progress-level';
export function getMyProgress(): Promise<{ levels: MyProgressLevel[]; overallPercentage: number }> {
  return apiGet('/students/me/progress');
}
