import { apiDelete } from '.././api';
import type { IntakeItem } from './intake-item';
export function archiveIntake(id: string): Promise<IntakeItem> {
  return apiDelete<IntakeItem>(`/intakes/${id}`);
}
