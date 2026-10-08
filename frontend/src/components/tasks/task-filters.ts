import type { TaskItem } from './task-types';

export type Filters = { kind: string; status: string; q: string; scope: string };

export function applyFilters(items: TaskItem[], f: Filters): TaskItem[] {
  const q = f.q.trim().toLowerCase();
  return items.filter(i => (!f.kind || i.kind === f.kind) && (!f.scope || i.scopeId === f.scope) && (!q || `${i.title} ${i.scope}`.toLowerCase().includes(q))
    && (!f.status || (f.status === 'review' ? i.toReview > 0 : i.status === f.status)));
}
