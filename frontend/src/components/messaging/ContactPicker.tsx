import { useMemo,useState } from 'react';
import { FiMessageCircle,FiSearch,FiX } from 'react-icons/fi';
import type { Contact } from '../../lib/services';
import { humanize } from '../../lib/services';
import { Dialog } from '../ui/overlay/Dialog';
import { accentFor,initials } from './utils';

type Props = { open: boolean; onClose: () => void; contacts: Contact[]; loading: boolean; error: string | null; onPick: (id: string) => void };

export function ContactPicker({ open, onClose, contacts, loading, error, onPick }: Props) {
 const [q, setQ] = useState('');
 const uniqueContacts = useMemo(() => {
 const seen = new Set<string>();
 return contacts.filter((c) => {
 if (seen.has(c.id)) return false;
 seen.add(c.id);
 return true;
 });
 }, [contacts]);
 const filtered = useMemo(() => {
 if (!q.trim()) return uniqueContacts;
 const needle = q.trim().toLowerCase();
 return uniqueContacts.filter((c) => `${c.firstName} ${c.lastName} ${c.role}`.toLowerCase().includes(needle));
 }, [uniqueContacts, q]);

 return (
 <Dialog open={open} onClose={onClose} size="sm" icon={FiMessageCircle} title="New chat" subtitle="Start a conversation with a classmate or teacher.">
 <div className="-mx-1 space-y-3">
 <div>
 <div className="relative">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted" />
 <input value={q} onChange={(e) => setQ(e.currentTarget.value)} placeholder="Search contacts…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
 {q ? <button type="button" onClick={() => setQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2"><FiX aria-hidden /></button> : null}
 </div>
 </div>
 <div>
 {loading ? <p className="py-10 text-center text-xs text-muted">Loading contacts…</p> : error ? <p className="rounded-box bg-coral px-3 py-2 text-xs font-medium text-error-content">{error}</p> : filtered.length === 0 ? <p className="py-10 text-center text-xs text-muted">{contacts.length === 0 ? 'No contacts yet — classmates and teachers appear here once you are enrolled.' : 'No matches.'}</p> : (
 <ul className="space-y-1">
 {filtered.map((c) => (
 <li key={c.id}>
 <button type="button" onClick={() => onPick(c.id)} className="flex w-full items-center gap-3 rounded-box border border-line bg-base-100 p-3 text-left hover:border-primary hover:bg-brand-tint">
 <span className={`flex size-9 items-center justify-center rounded-full text-xs font-bold ${accentFor(c.firstName)}`}>{initials(c.firstName, c.lastName)}</span>
 <span className="min-w-0 grow">
 <span className="block truncate text-sm font-semibold leading-tight">{c.firstName} {c.lastName}</span>
 <span className="block truncate text-[0.6875rem] text-muted">{humanize(c.role)}</span>
 </span>
 </button>
 </li>
 ))}
 </ul>
 )}
 </div>
 </div>
 </Dialog>
 );
}
