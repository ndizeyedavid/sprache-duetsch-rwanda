import { apiGet } from '.././api';
import type { ClassGroupItem } from './class-group-item';
export function listClasses(): Promise<ClassGroupItem[]> {
  return apiGet<ClassGroupItem[]>('/classes?pageSize=100');
}
