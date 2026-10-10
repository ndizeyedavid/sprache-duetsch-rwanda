import { apiGet } from '.././api';
import type { StudentLesson } from './student-lesson';
export function getStudentLesson(id: string): Promise<StudentLesson> {
  return apiGet<StudentLesson>(`/content/my/lessons/${id}`);
}
