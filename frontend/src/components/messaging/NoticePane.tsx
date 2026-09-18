import { FiBell, FiCheck, FiSearch, FiX } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { StatusBadge } from '../ui/StatusBadge';
import { humanize, isoDate } from '../../lib/services';
import type { NotificationItem } from '../../lib/services';

type Props = {
  notices: NotificationItem[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  selectedId: string | null;
  onPick: (id: string) => void;
  search: string;
  onSearch: (v: string) => void;
  filter: "all" | "unread";
  onFilter: (v: "all" | "unread") => void;
  onMarkAll: () => void;
  markingAll: boolean;
  noticeError: string | null;
};

export function NoticeList({ notices, loading, error, onRetry, selectedId, onPick, search, onSearch, filter, onFilter, onMarkAll, markingAll, noticeError }: Props) {
 const filtered = search.trim() ? notices.filter((n) => `${n.title} ${n.body ?? ''}`.toLowerCase().includes(search.trim().toLowerCase())) : notices;
 const unread = notices.filter((n) => !n.readAt).length;
 return (
 <div className="flex h-full flex-col">
 <div className="flex items-center justify-between gap-2">
 <h3 className="flex items-center gap-2 text-sm font-bold"><FiBell aria-hidden className="text-brand" />Notices</h3>
 <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${unread ? 'bg-coral-soft text-[#D8482F]' : 'bg-base-200 text-muted'}`}>{unread} unread</span>
 </div>
  <button type="button" disabled={markingAll} onClick={onMarkAll} className="btn btn-sm mt-3 w-full gap-1 rounded-full border-line bg-base-100 disabled:opacity-60">
  {markingAll ? <span className="loading loading-spinner loading-xs" /> : <FiCheck aria-hidden />}Mark all as read
  </button>
  {noticeError ? <p role="alert" className="mt-2 rounded-box bg-coral-soft px-3 py-2 text-xs font-medium text-[#D8482F]">{noticeError}</p> : null}
  <div className="relative mt-3">
  <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
  <input value={search} onChange={(e) => onSearch(e.currentTarget.value)} placeholder="Search notices…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-sm" />
  {search ? <button type="button" onClick={() => onSearch('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
  </div>
  <div className="mt-3 flex gap-1.5">
  <button type="button" onClick={() => onFilter("all")} className={`btn btn-xs rounded-full ${filter === "all" ? "border-0 bg-brand text-white" : "border-line bg-base-100"}`}>All</button>
  <button type="button" onClick={() => onFilter("unread")} className={`btn btn-xs rounded-full ${filter === "unread" ? "border-0 bg-brand text-white" : "border-line bg-base-100"}`}>Unread</button>
  </div>
 <div className="mt-3 flex-1 overflow-y-auto pr-1">
 {loading ? <LoadingBlock label="Loading notices…" /> : error ? <ErrorBlock message={error} onRetry={onRetry} /> : filtered.length === 0 ? <EmptyBlock title={notices.length === 0 ? 'No notices' : 'No matches'} hint={notices.length === 0 ? 'Announcements from teachers appear here.' : 'Try another search.'} /> : (
 <ul className="space-y-2">
 {filtered.map((n) => {
 const active = selectedId === n.id;
 const unreadFlag = !n.readAt;
 return (
 <li key={n.id}>
 <button type="button" onClick={() => onPick(n.id)} className={`w-full rounded-box border p-3 text-left transition ${active ? 'border-brand bg-brand-soft' : unreadFlag ? 'border-brand/20 bg-brand-soft/40 hover:border-brand/30' : 'border-line bg-base-100 hover:border-brand/20'}`}>
 <span className="flex items-start justify-between gap-2">
 <span className="truncate text-xs font-semibold leading-tight">{n.title}</span>
 {unreadFlag ? <span aria-label="Unread" className="size-2 shrink-0 rounded-full bg-brand" /> : null}
 </span>
 <span className="mt-1 block truncate text-[11px] text-muted">{humanize(n.type)} · {isoDate(n.createdAt)}</span>
 {n.body ? <span className="mt-1 line-clamp-2 block text-xs leading-snug text-muted">{n.body}</span> : null}
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

export function NoticeDetail({ notice, onBack }: { notice: { title: string; body: string | null; type: string; createdAt: string; readAt: string | null } | null; onBack?: () => void }) {
  if (!notice) return <div className="flex h-full min-h-[50vh] items-center justify-center"><EmptyBlock title="Select a notice" hint="Choose a notice on the left to read it here." /></div>;
  return (
  <article className="p-6">
  {onBack ? <button type="button" onClick={onBack} className="btn btn-ghost btn-xs gap-1 lg:hidden">← Back</button> : null}
  <StatusBadge status={notice.readAt ? 'Read' : 'Unread'} />
  <h2 className="mt-3 text-lg font-bold leading-tight">{notice.title}</h2>
  <p className="mt-1 text-xs text-muted">{humanize(notice.type)} · {isoDate(notice.createdAt)}</p>
  <div className="mt-4 rounded-box border border-line bg-base-200/30 p-4">
  <p className="whitespace-pre-wrap text-sm leading-relaxed">{notice.body ?? 'No content.'}</p>
  </div>
  </article>
  );
}
