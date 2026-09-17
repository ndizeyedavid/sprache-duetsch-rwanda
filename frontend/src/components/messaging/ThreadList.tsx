import { FiMessageSquare, FiSearch, FiX } from 'react-icons/fi';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../common/PageState';
import { relativeTime, snippet, threadTitle, initials, accentFor, dedupeParticipants } from './utils';
import type { Conversation } from '../../lib/services';

type Props = {
 threads: Conversation[];
 loading: boolean;
 error: string | null;
 onRetry: () => void;
 selectedId: string | null;
 onPick: (id: string) => void;
 myId: string | null | undefined;
 search: string;
 onSearch: (v: string) => void;
 filter: 'all' | 'unread';
 onFilter: (v: 'all' | 'unread') => void;
 onNew: () => void;
};

export function ThreadList({ threads, loading, error, onRetry, selectedId, onPick, myId, search, onSearch, filter, onFilter, onNew }: Props) {
 const filtered = threads.filter((t) => {
 if (filter === 'unread' && t.unreadCount === 0) return false;
 if (!search.trim()) return true;
 const q = search.trim().toLowerCase();
 const title = threadTitle(t, myId).toLowerCase();
 const last = (t.messages[0]?.body ?? '').toLowerCase();
 return title.includes(q) || last.includes(q);
 });

 return (
 <div className="flex h-full flex-col">
 <div className="flex items-center justify-between gap-2">
 <h3 className="flex items-center gap-2 text-sm font-bold"><FiMessageSquare aria-hidden className="text-brand" />Conversations</h3>
 <span className="rounded-full bg-base-200 px-2.5 py-1 text-xs font-medium">{threads.length}</span>
 </div>

 <button type="button" onClick={onNew} className="btn btn-sm mt-3 w-full gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90">New chat</button>

 <div className="relative mt-3">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={search} onChange={(e) => onSearch(e.currentTarget.value)} placeholder="Search chats…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
 {search ? <button type="button" onClick={() => onSearch('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear"><FiX aria-hidden /></button> : null}
 </div>

 <div className="mt-3 flex gap-1.5">
 <button type="button" onClick={() => onFilter('all')} className={`btn btn-xs rounded-full ${filter === 'all' ? 'border-0 bg-brand text-white' : 'border-line bg-base-100'}`}>All</button>
 <button type="button" onClick={() => onFilter('unread')} className={`btn btn-xs rounded-full ${filter === 'unread' ? 'border-0 bg-brand text-white' : 'border-line bg-base-100'}`}>Unread {threads.filter((t) => t.unreadCount > 0).length ? `(${threads.filter((t: Conversation) => t.unreadCount > 0).length})` : ''}</button>
 </div>

 <div className="mt-3 flex-1 overflow-y-auto pr-1">
 {loading ? <LoadingBlock label="Loading…" /> : error ? <ErrorBlock message={error} onRetry={onRetry} /> : filtered.length === 0 ? (
 <EmptyBlock title={threads.length === 0 ? 'No conversations' : 'No matches'} hint={threads.length === 0 ? 'Start a chat with a classmate or teacher.' : 'Try another search or clear the filter.'} />
 ) : (
 <ul className="space-y-2">
 {filtered.map((t) => {
 const last = t.messages[0];
 const active = selectedId === t.id;
 const title = threadTitle(t, myId);
 const others = dedupeParticipants(t.participants).filter((p) => p.user.id !== myId).slice(0, 2);
 return (
 <li key={t.id}>
 <button type="button" onClick={() => onPick(t.id)} className={`flex w-full gap-3 rounded-box border p-3 text-left transition ${active ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20 hover:'}`}>
 <span className="flex -space-x-2">
 {others.length === 0 ? (
 <span className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${accentFor(title)}`}>{initials('Y', 'ou')}</span>
 ) : others.map((p) => (
 <span key={p.user.id} className={`flex size-9 items-center justify-center rounded-full border-2 border-base-100 text-xs font-bold ${accentFor(p.user.firstName)}`}>{initials(p.user.firstName, p.user.lastName)}</span>
 ))}
 </span>
 <span className="min-w-0 grow">
 <span className="flex items-start justify-between gap-2">
 <span className="truncate text-xs font-semibold leading-tight">{title}</span>
 {t.unreadCount > 0 ? <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-white">{t.unreadCount}</span> : null}
 </span>
 <span className="block truncate text-[11px] text-muted">{last ? `${last.sender.firstName}: ${snippet(last.body)}` : 'No messages yet'}</span>
 <span className="block text-[10px] text-muted">{relativeTime(t.updatedAt)}</span>
 </span>
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
