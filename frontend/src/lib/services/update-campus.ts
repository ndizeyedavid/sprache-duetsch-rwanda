import { apiPatch } from '.././api';
import type { CampusItem } from './campus-item';
export function updateCampus(id: string, body: Record<string, unknown>): Promise<CampusItem> {
  return apiPatch<CampusItem>(`/campuses/${id}`, body);
}
