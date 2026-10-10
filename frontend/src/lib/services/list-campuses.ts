import { apiGet } from '.././api';
import type { ReferenceItem } from './reference-item';
export function listCampuses(): Promise<ReferenceItem[]> {
  return apiGet<ReferenceItem[]>('/campuses?pageSize=100');
}
