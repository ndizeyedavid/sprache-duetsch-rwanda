import { apiGet } from '.././api';
import type { CampusItem } from './campus-item';
export function listCampusesFull(): Promise<CampusItem[]> {
  return apiGet<CampusItem[]>('/campuses?pageSize=100');
}
