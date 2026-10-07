import { apiGet } from '.././api';
import type { AcademicDashboard } from './academic-dashboard';
export function getAcademicDashboard(): Promise<AcademicDashboard> {
  return apiGet<AcademicDashboard>('/dashboards/academic');
}
