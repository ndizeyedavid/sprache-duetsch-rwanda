import { useMemo,useState } from 'react';
import { FiCalendar,FiSearch,FiX } from 'react-icons/fi';
import type { ApiState } from '../../hooks/useApi';
import { useApi } from '../../hooks/useApi';
import type { SessionItem } from '../../lib/services';
import { isoDate,isoTime,listClasses } from '../../lib/services';
import { sessionStatusLabel,sessionTone } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';

type Props = { sessions: ApiState<SessionItem[]>; selectedId: string | null; onPick: (id: string) => void; disabled: boolean };
export function LiveSessionPicker({ sessions, selectedId, onPick, disabled }: Props) {
 const classes = useApi('class-groups-filter', listClasses);
 const [sessionQ, setSessionQ] = useState('');
 const [sessionClass, setSessionClass] = useState('');
 const list = useMemo(() => [...(sessions.data ?? [])].sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()), [sessions.data]);
 const filteredSessions = useMemo(() => {
 let out = list;
 if (sessionClass) out = out.filter((s) => s.classGroup?.id === sessionClass);
 if (sessionQ.trim()) {
 const needle = sessionQ.trim().toLowerCase();
 out = out.filter((s) => `${s.title} ${s.classGroup?.name ?? ''}`.toLowerCase().includes(needle));
 }
 return out;
 }, [list, sessionClass, sessionQ]);
 return (
 <Panel className="lg:col-span-4 xl:col-span-3">
 <div className="flex items-center justify-between gap-2">
 <h3 className="flex items-center gap-2 text-sm font-bold"><FiCalendar aria-hidden className="text-brand" />Sessions</h3>
 <select value={sessionClass} onChange={(e) => setSessionClass(e.currentTarget.value)} className="select select-xs max-w-[140px] rounded-full border-line bg-base-100 text-xs" aria-label="Filter sessions by class">
 <option value="">All classes</option>
 {(classes.data ?? []).map((c) => (
 <option key={c.id} value={c.id}>{c.name} {c.level ? `· ${c.level.code}` : ''}</option>
 ))}
 </select>
 </div>
 <div className="relative mt-3">
 <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
 <input value={sessionQ} onChange={(e) => setSessionQ(e.currentTarget.value)} placeholder="Filter sessions…" className="input input-sm w-full rounded-full border-line bg-base-100 pl-9 pr-8 text-xs" />
 {sessionQ ? <button type="button" onClick={() => setSessionQ('')} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear session filter"><FiX aria-hidden /></button> : null}
 </div>
 {sessionQ || sessionClass ? <p className="mt-2 text-xs text-muted">Showing {filteredSessions.length} of {list.length}<button type="button" onClick={() => { setSessionQ(''); setSessionClass(''); }} className="link link-hover ml-2 text-brand">Clear</button></p> : null}
 {sessions.loading ? <div className="mt-3"><LoadingBlock label="Loading…" /></div> : sessions.error || !sessions.data ? <div className="mt-3"><ErrorBlock message={sessions.error ?? 'Could not load.'} onRetry={sessions.refetch} /></div> : list.length === 0 ? <div className="mt-3"><EmptyBlock title="No sessions yet" /></div> : filteredSessions.length === 0 ? <div className="mt-3"><EmptyBlock title="No sessions match" hint="Try another class or search." /></div> : (
 <ul className="mt-3 space-y-2 max-h-[55vh] overflow-y-auto pr-1">
 {filteredSessions.map((item) => {
 const tone = sessionTone(item.status);
 const tc = TONE_CLASSES[tone];
 const active = selectedId === item.id;
 return (
 <li key={item.id}>
 <button type="button" disabled={disabled} onClick={() => onPick(item.id)} className={`flex w-full gap-3 rounded-box border p-3 text-left transition ${active ? 'border-brand bg-brand-soft' : 'border-line bg-base-100 hover:border-brand/20'}`}>
 <span className="w-1 shrink-0 self-stretch rounded-full" style={{ background: tc.hex }} aria-hidden />
 <span className="min-w-0 grow">
 <span className="block truncate text-xs font-semibold leading-tight">{item.title}</span>
 <span className="mt-1 block text-[11px] text-muted">{isoDate(item.startAt)} · {isoTime(item.startAt)}</span>
 <span className={`mt-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${tc.soft} ${tc.text}`}>{sessionStatusLabel(item.status)}</span>
 </span>
 </button>
 </li>
 );
 })}
 </ul>
 )}
 </Panel>
 );
}
