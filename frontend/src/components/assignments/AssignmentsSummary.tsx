import type { CSSProperties } from 'react';
import { FiArrowRight, FiCheck } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { AssignmentItem } from '../../lib/services';
import { bucketOf } from './utils';

export function AssignmentsSummary({ items }: { items: AssignmentItem[] }) {
  const completed = items.filter((item) => bucketOf(item) === 'Done').length;
  const pending = items.filter((item) => bucketOf(item) !== 'Done');
  const next = [...pending].sort((a, b) => (a.dueAt ? new Date(a.dueAt).getTime() : Infinity) - (b.dueAt ? new Date(b.dueAt).getTime() : Infinity))[0];
  const percent = items.length ? Math.round(completed / items.length * 100) : 0;
  return (
    <section className="card overflow-hidden border border-base-300/70 bg-base-100">
      <div className="journey-hero flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
        <div className="flex items-center gap-4"><img src="/illustrations/study-books.webp" alt="" aria-hidden="true" width={400} height={366} className="h-20 w-20 shrink-0 object-contain" /><div><h2 className="text-2xl font-semibold tracking-tight">Assignments</h2><p className="mt-1 text-xs text-base-content/65">Practice, submit, and see your feedback.</p></div></div>
        <div className="flex items-center gap-4"><div className="radial-progress text-primary" style={{ '--value': percent, '--size': '3.5rem', '--thickness': '4px' } as CSSProperties} role="progressbar" aria-label="Assignments submitted" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><FiCheck aria-hidden className="text-lg" /></div><div><p className="text-xl font-semibold">{completed}<span className="text-sm font-normal text-base-content/55"> / {items.length}</span></p><p className="mt-1 text-[10px] text-base-content/60">submitted</p></div></div>
      </div>
      {next ? <div className="flex flex-wrap items-center justify-between gap-3 border-t border-base-300/60 px-5 py-3 sm:px-6"><div className="min-w-0"><p className="text-[10px] font-medium uppercase tracking-widest text-base-content/55">Next to tackle · {next.levelCode}</p><h3 className="mt-1 text-sm font-semibold">{next.title}</h3></div><Link to={`/assignments/${encodeURIComponent(next.id)}`} className="btn btn-neutral btn-sm gap-2 rounded-full">{next.status === 'IN_PROGRESS' ? 'Continue' : 'Open assignment'}<FiArrowRight aria-hidden /></Link></div> : null}
    </section>
  );
}
