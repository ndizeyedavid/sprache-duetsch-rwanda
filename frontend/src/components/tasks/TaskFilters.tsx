import { FiRefreshCw, FiSearch } from 'react-icons/fi';
import type { Filters } from './task-filters';
import type { TaskItem } from './task-types';

type Props = { items: TaskItem[]; value: Filters; onChange: (key: keyof Filters, value: string) => void; fetching: boolean; onRefresh: () => void };

const KIND_TABS = [['', 'All'], ['HOMEWORK', 'Homework'], ['QUIZ', 'Quizzes'], ['TEST', 'Tests']] as const;

export function TaskFilters({ items, value, onChange, fetching, onRefresh }: Props) {
  const scopes = [...new Map(items.map(i => [i.scopeId, i.scope])).entries()].sort((a, b) => a[1].localeCompare(b[1]));
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="inline-flex gap-1 rounded-full bg-base-200 p-1" role="tablist" aria-label="Kind">
        {KIND_TABS.map(([kind, label]) => {
          const count = kind ? items.filter(i => i.kind === kind).length : items.length;
          return <button key={kind} type="button" role="tab" aria-selected={value.kind === kind} onClick={() => onChange('kind', kind)}
            className={`rounded-full px-3 py-1 text-sm ${value.kind === kind ? 'bg-base-100 font-semibold text-brand ' : 'text-muted'}`}>{label} <span className="text-xs text-muted">{count}</span></button>;
        })}
      </div>
      <select aria-label="Status" className="select select-sm w-auto rounded-full" value={value.status} onChange={e => onChange('status', e.target.value)}>
        <option value="">Any status</option><option value="review">Needs review</option><option value="DRAFT">Drafts</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
      </select>
      <select aria-label="Class or level" className="select select-sm w-auto max-w-56 rounded-full" value={value.scope} onChange={e => onChange('scope', e.target.value)}>
        <option value="">All classes and levels</option>{scopes.map(([id, label]) => <option key={id} value={id}>{label}</option>)}
      </select>
      <label className="input input-sm min-w-48 flex-1 rounded-full"><FiSearch aria-hidden /><input aria-label="Search" placeholder="Search by title…" value={value.q} onChange={e => onChange('q', e.target.value)} /></label>
      <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Refresh" disabled={fetching} onClick={onRefresh}><FiRefreshCw aria-hidden className={fetching ? 'animate-spin' : ''} /></button>
    </div>
  );
}

