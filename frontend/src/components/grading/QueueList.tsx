import { FiInbox, FiSearch, FiX } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { humanize, isoDate } from '../../lib/services';
import { FILTERS, FILTER_META } from './constants';
import type { Filter } from './constants';
import { TONE_CLASSES } from '../../lib/theme';
import { initials } from './utils';

type Attempt = { id: string; status: string; cheatFlagged?: boolean; cheatCount?: number; assessment: { title: string }; student: { studentCode: string; user: { firstName: string; lastName: string } }; submittedAt: string | null; score: number | null };

type Props = {
 attempts: Attempt[];
 loading: boolean;
 error: string | null;
 onRetry: () => void;
 filter: Filter;
 onFilter: (f: Filter) => void;
 search: string;
 onSearch: (v: string) => void;
 selectedId: string | null;
 onPick: (id: string) => void;
};

export function QueueList({ attempts, loading, error, onRetry, filter, onFilter, search, onSearch, selectedId, onPick }: Props) {
 const meta = FILTER_META[filter];
 return (
 <div>
 <div className="flex flex-wrap gap-1.5">
 {FILTERS.map((name) => {
 const m = FILTER_META[name];
 const active = filter === name;
 return (
 <button key={name} type="button" onClick={() => onFilter(name)} aria-pressed={active} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition ${active ? 'border-brand bg-brand text-white' : 'border-line bg-base-100 text-muted hover:border-brand/20 hover:text-ink'}`}>
 <m.icon aria-hidden className="text-xs" />{m.label}
 </button>
 );
 })}
 </div>
 <p className="mt-2 text-[11px] text-muted">{meta.desc} · {attempts.length} submission{attempts.length === 1 ? '' : 's'}</p>

 <div className="relative mt-3">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={search} onChange={(e) => onSearch(e.currentTarget.value)} placeholder="Search student or assessment…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
 {search ? <button type="button" onClick={() => onSearch('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
 </div>

 <div className="mt-3">
 {loading ? <LoadingBlock label="Loading submissions…" /> : error ? <ErrorBlock message={error} onRetry={onRetry} /> : attempts.length === 0 ? (
 <EmptyBlock title={filter === 'SUBMITTED' ? 'All caught up' : 'Nothing here'} hint={filter === 'SUBMITTED' ? 'No submissions need grading right now.' : 'Submissions appear here once students submit.'} />
 ) : (
 <ul className="max-h-[58vh] space-y-2 overflow-y-auto pr-1">
 {attempts.map((a) => {
 const active = selectedId === a.id;
 const isGraded = a.status === 'GRADED';
 const tone = (isGraded ? 'brand' : a.status === 'IN_PROGRESS' ? 'sun' : 'coral') as keyof typeof TONE_CLASSES;
 const tc = TONE_CLASSES[tone];
 return (
 <li key={a.id}>
 <button type="button" onClick={() => onPick(a.id)} className={`flex w-full gap-3 rounded-box border p-3 text-left transition ${active ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20 hover:'}`}>
 <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-base-200 text-xs font-bold">{initials(a.student.user.firstName, a.student.user.lastName)}</span>
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-semibold leading-tight">{a.assessment.title}</span>
 <span className="block truncate text-[11px] text-muted">{a.student.user.firstName} {a.student.user.lastName} · {a.student.studentCode}</span>
  <span className="mt-1 flex flex-wrap items-center gap-1.5">
  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${tc.soft} ${tc.text}`}>{humanize(a.status)}</span>
  <span className="text-[11px] text-muted">{a.score != null ? `${a.score} pts` : isoDate(a.submittedAt) ?? '—'}</span>
  {a.cheatFlagged ? <span className="rounded-full bg-error px-2 py-0.5 text-[11px] font-bold text-white">Flagged · {a.cheatCount ?? 3}</span> : a.cheatCount ? <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[11px] font-medium text-warning">{a.cheatCount} violations</span> : null}
  </span>
 </span>
 {active ? <FiInbox aria-hidden className="shrink-0 text-brand" /> : null}
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </div>
 </div>
 );
}
