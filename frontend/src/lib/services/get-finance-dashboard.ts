import { apiGet } from '.././api';
import type { FinanceDashboard } from './finance-dashboard';
export function getFinanceDashboard(): Promise<FinanceDashboard> {
  return apiGet<FinanceDashboard>('/dashboards/finance');
}
