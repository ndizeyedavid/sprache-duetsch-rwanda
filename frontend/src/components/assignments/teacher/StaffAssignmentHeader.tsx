import { FiPlus } from 'react-icons/fi';
import type { Homework } from '../homework/types';
export function StaffAssignmentHeader({ items, onCreate, onFilter }: { items: Homework[]; onCreate: () => void; onFilter: (value: string) => void }) {
  const metrics = [
    { label: 'Published', value: items.filter(a => a.status === 'PUBLISHED').length, filter: 'PUBLISHED', hint: 'Includes scheduled work' },
    { label: 'Drafts', value: items.filter(a => a.status === 'DRAFT').length, filter: 'DRAFT', hint: 'Only visible to staff' },
    { label: 'Awaiting review', value: items.reduce((sum, a) => sum + (a.summary?.toReview ?? 0), 0), filter: 'review', hint: 'Open a task to grade' },
  ];
  return <section className="card border border-base-300/70 bg-base-100">
    <div className="flex flex-wrap items-center justify-between gap-4 p-5 sm:p-7"><div><h1 className="text-2xl font-semibold tracking-tight">Assignments</h1><p className="mt-2 max-w-xl text-sm leading-6 text-base-content/65">Untimed class tasks: written work, files, audio, or questions you write. Set a deadline, review responses, and send feedback.</p></div><button className="btn btn-primary rounded-full" onClick={onCreate}><FiPlus aria-hidden />Create assignment</button></div>
    <div className="grid grid-cols-3 border-t border-base-300/60">{metrics.map(m => <button key={m.label} onClick={() => onFilter(m.filter)} className="min-w-0 p-4 text-left hover:bg-base-200/50 sm:px-7"><span className="block text-2xl font-semibold">{m.value}</span><span className="mt-1 block text-xs font-semibold">{m.label}</span><span className="mt-1 hidden text-[11px] text-base-content/55 sm:block">{m.hint}</span></button>)}</div>
  </section>;
}
