import { apiPatch } from '.././api';
import type { ClassGroupDetail } from './class-group-detail';
export function updateClass(id: string, body: Record<string, unknown>): Promise<ClassGroupDetail> {
  return apiPatch<ClassGroupDetail>(`/classes/${id}`, body);
}
