import { apiPost } from '.././api';
import type { IntakeItem } from './intake-item';
export function createIntake(body: Record<string, unknown>): Promise<IntakeItem> {
  return apiPost<IntakeItem>('/intakes', body);
}
