import { apiPost } from '.././api';
import type { ModuleItem } from './module-item';
export function createModule(levelId: string, body: Record<string, unknown>): Promise<ModuleItem> {
  return apiPost<ModuleItem>(`/content/levels/${levelId}/modules`, body);
}
