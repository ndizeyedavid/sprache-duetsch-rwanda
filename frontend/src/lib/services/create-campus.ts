import { apiPost } from '.././api';
import type { CampusItem } from './campus-item';
export function createCampus(body: Record<string, unknown>): Promise<CampusItem> {
  return apiPost<CampusItem>('/campuses', body);
}
