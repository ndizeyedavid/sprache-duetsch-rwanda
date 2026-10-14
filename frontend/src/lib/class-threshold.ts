import { apiGet } from './api';

export type ResolvedThreshold = { value: number; source: 'CLASS' | 'LEVEL' | 'SYSTEM'; inherited: number; inheritedSource: 'LEVEL' | 'SYSTEM' };

/** What a class at this level inherits when it has no attendance threshold of its own. */
export function getInheritedThreshold(levelId: string): Promise<ResolvedThreshold & { system: number }> {
  return apiGet(`/classes/attendance-threshold?levelId=${encodeURIComponent(levelId)}`);
}
