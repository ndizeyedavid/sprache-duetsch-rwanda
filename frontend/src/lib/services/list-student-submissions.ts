import { apiGet } from '.././api';
import type { ActivitySubmission } from './activity-submission';
export type StudentSubmission = ActivitySubmission & {
  activity: { id: string; title: string; type: string; lesson: { id: string; title: string; module: { level: { code: string } } } };
};
export function listStudentSubmissions(studentId: string): Promise<StudentSubmission[]> {
  return apiGet<StudentSubmission[]>(`/content/activity-submissions?studentId=${studentId}&pageSize=100`);
}
