import { apiGet } from '.././api';
import type { ReferenceItem } from './reference-item';
export function listIntakes(): Promise<ReferenceItem[]> {
  return apiGet<ReferenceItem[]>('/intakes?pageSize=100');
}
