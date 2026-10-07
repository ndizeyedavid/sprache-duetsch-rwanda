import { apiPatch } from '.././api';
import type { IntakeItem } from './intake-item';
export function updateIntake(id: string, body: Record<string, unknown>): Promise<IntakeItem> {
  return apiPatch<IntakeItem>(`/intakes/${id}`, body);
}
