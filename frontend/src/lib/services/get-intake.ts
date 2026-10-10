import { apiGet } from '.././api';
import type { IntakeItem } from './intake-item';
export function getIntake(id: string): Promise<IntakeItem> {
  return apiGet<IntakeItem>(`/intakes/${id}`);
}
