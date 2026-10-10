import { apiGet } from '.././api';
import type { TeacherRow } from './teacher-row';
export function listTeachers(): Promise<TeacherRow[]> {
  return apiGet<TeacherRow[]>('/users/teachers');
}
