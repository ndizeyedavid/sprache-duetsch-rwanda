import { apiPatch } from '.././api';
import type { ModuleItem } from './module-item';
export function updateModule(id: string, body: Record<string, unknown>): Promise<ModuleItem> {
  return apiPatch<ModuleItem>(`/content/modules/${id}`, body);
}
