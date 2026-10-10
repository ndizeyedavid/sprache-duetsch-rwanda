import { apiGet } from '.././api';
import type { FinanceSummary } from './finance-summary';
export function getFinanceReportSummary(): Promise<FinanceSummary> {
  return apiGet<FinanceSummary>('/payments/reports/summary');
}
