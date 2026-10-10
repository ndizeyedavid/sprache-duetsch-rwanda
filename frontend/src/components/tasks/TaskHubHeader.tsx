import type { TaskItem, TaskKind } from './task-types';
import { NewTaskMenu } from './NewTaskMenu';

/** Page title, three quick counts and the New button. */
export function TaskHubHeader({ items, onCreate, onFilter }: { items: TaskItem[]; onCreate: (kind: TaskKind) => void; onFilter: (status: string) => void }) {
  const stats: [string, number, string][] = [
    ['Need review', items.reduce((t, i) => t + i.toReview, 0), 'review'],
    ['Drafts', items.filter(i => i.status === 'DRAFT').length, 'DRAFT'],
    ['Published', items.filter(i => i.status === 'PUBLISHED').length, 'PUBLISHED'],
  ];
  return (
    <header className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Assignments</h1>
        <p className="mt-1 text-sm text-muted">Homework, quizzes and tests for your classes, in one place.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {stats.map(([label, count, status]) => (
            <button key={label} type="button" onClick={() => onFilter(status)} className="rounded-full border border-base-300 bg-base-100 px-3 py-1 text-xs hover:border-brand">
              <strong className={`tabular-nums ${status === 'review' && count ? 'text-brand' : ''}`}>{count}</strong> <span className="text-muted">{label}</span>
            </button>
          ))}
        </div>
      </div>
      <NewTaskMenu onCreate={onCreate} />
    </header>
  );
}
