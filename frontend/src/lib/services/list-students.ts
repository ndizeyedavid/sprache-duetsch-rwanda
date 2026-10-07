import { apiGet } from '.././api';
import type { StudentRow } from './student-row';
export function listStudents(): Promise<StudentRow[]> {
  return apiGet<StudentRow[]>('/students?pageSize=100');
}
