import { apiPost } from '.././api';
import type { ClassGroupDetail } from './class-group-detail';
export function createClass(body: Record<string, unknown>): Promise<ClassGroupDetail> {
  return apiPost<ClassGroupDetail>('/classes', body);
}
