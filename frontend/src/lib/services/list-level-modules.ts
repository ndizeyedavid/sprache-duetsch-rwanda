import { apiGet } from '.././api';
import type { ModuleItem } from './module-item';
export function listLevelModules(levelId: string): Promise<ModuleItem[]> {
  return apiGet<ModuleItem[]>(`/content/levels/${levelId}/modules`);
}
