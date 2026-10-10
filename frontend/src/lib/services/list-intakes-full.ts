import { apiGet } from '.././api';
import type { IntakeItem } from './intake-item';
export function listIntakesFull(): Promise<IntakeItem[]> {
  return apiGet<IntakeItem[]>('/intakes?pageSize=100');
}
