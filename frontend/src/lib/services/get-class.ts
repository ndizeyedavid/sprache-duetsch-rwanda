import { apiGet } from '.././api';
import type { ClassGroupDetail } from './class-group-detail';
export function getClass(id: string): Promise<ClassGroupDetail> {
  return apiGet<ClassGroupDetail>(`/classes/${id}`);
}
