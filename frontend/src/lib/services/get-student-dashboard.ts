import { apiGet } from '.././api';
import type { StudentDashboard } from './student-dashboard';
export function getStudentDashboard(): Promise<StudentDashboard> {
  return apiGet<StudentDashboard>('/dashboards/student');
}
