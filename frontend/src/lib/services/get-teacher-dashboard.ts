import { apiGet } from '.././api';
import type { TeacherDashboard } from './teacher-dashboard';
export function getTeacherDashboard(): Promise<TeacherDashboard> {
  return apiGet<TeacherDashboard>('/dashboards/teacher');
}
