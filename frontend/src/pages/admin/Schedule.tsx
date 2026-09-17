import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, addMonths, format, isSameDay, parseISO, subDays, subMonths } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage } from '../../lib/api';
import { listClasses, listSessions } from '../../lib/services';
import { ScheduleToolbar } from '../../components/schedule/ScheduleToolbar';
import { ClassFilterChips } from '../../components/schedule/ClassFilterChips';
import { AgendaGrouped } from '../../components/schedule/AgendaGrouped';
import { MonthGrid } from '../../components/schedule/MonthGrid';
import { WeekGrid } from '../../components/schedule/WeekGrid';
import { SessionDetailDrawer } from '../../components/schedule/SessionDetailDrawer';
import { SessionEditorModal } from '../../components/schedule/SessionEditorModal';
import type { ScheduleView } from '../../components/schedule/constants';

export function AdminSchedule() {
 const [searchParams, setSearchParams] = useSearchParams();
 const sessions = useApi('all-sessions', listSessions);
 const classes = useApi('class-groups', listClasses);

 const view = (searchParams.get('view') as ScheduleView) || 'agenda';
 const dateParam = searchParams.get('date');
 const anchor = useMemo(() => (dateParam ? parseISO(dateParam) : new Date()), [dateParam]);
 const classFilter = searchParams.get('class') || null;
 const statusFilter = searchParams.get('status') || '';
 const q = searchParams.get('q') || '';
 const [localQ, setLocalQ] = useState(q);
 const [drawerId, setDrawerId] = useState<string | null>(null);
 const [editorOpen, setEditorOpen] = useState(false);
 const [editingId, setEditingId] = useState<string | null>(null);
 const [draftDate, setDraftDate] = useState<string | null>(null);

 function setParam(key: string, value: string | null) {
 const next = new URLSearchParams(searchParams);
 if (!value) next.delete(key);
 else next.set(key, value);
 setSearchParams(next);
 }
 function setView(v: ScheduleView) { setParam('view', v === 'agenda' ? null : v); }
 function setAnchor(d: Date) { setParam('date', format(d, 'yyyy-MM-dd')); }
 function step(dir: number) {
 if (view === 'month') setAnchor(dir > 0 ? addMonths(anchor, 1) : subMonths(anchor, 1));
 else if (view === 'week') setAnchor(dir > 0 ? addDays(anchor, 7) : subDays(anchor, 7));
 else setAnchor(dir > 0 ? addDays(anchor, 1) : subDays(anchor, 1));
 }

 const filtered = useMemo(() => {
 let list = sessions.data ?? [];
 if (classFilter) list = list.filter((s) => s.classGroup?.id === classFilter);
 if (statusFilter) list = list.filter((s) => s.status === statusFilter);
 if (q) {
 const needle = q.toLowerCase();
 list = list.filter((s) => s.title.toLowerCase().includes(needle) || (s.classGroup?.name ?? '').toLowerCase().includes(needle));
 }
 if (view === 'agenda') return [...list].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
 if (view === 'week') {
 const start = new Date(anchor); start.setDate(anchor.getDate() - anchor.getDay() + 1); start.setHours(0, 0, 0, 0);
 const end = new Date(start); end.setDate(end.getDate() + 7);
 return list.filter((s) => { const d = new Date(s.startAt); return d >= start && d < end; });
 }
 const m = anchor.getMonth(); const y = anchor.getFullYear();
 return list.filter((s) => { const d = new Date(s.startAt); return d.getMonth() === m && d.getFullYear() === y; });
 }, [sessions.data, classFilter, statusFilter, q, view, anchor]);

 const drawerSession = drawerId ? (sessions.data ?? []).find((s) => s.id === drawerId) ?? null : null;
 const editingSession = editingId ? (sessions.data ?? []).find((s) => s.id === editingId) ?? null : null;
 const todayCount = (sessions.data ?? []).filter((s) => isSameDay(parseISO(s.startAt), new Date())).length;

 return (
 <div className="space-y-4">
 <Panel>
 <ScheduleToolbar view={view} onView={setView} anchor={anchor} onPrev={() => step(-1)} onNext={() => step(1)} onToday={() => setAnchor(new Date())} onNew={() => { setEditingId(null); setDraftDate(null); setEditorOpen(true); }} canCreate />
 <div className="mt-4">
 <ClassFilterChips classes={(classes.data ?? []) as never} selected={classFilter} onSelect={(id) => setParam('class', id)} search={localQ} onSearch={setLocalQ} status={statusFilter} onStatus={(v) => setParam('status', v || null)} />
 {localQ !== q ? <button type="button" onClick={() => setParam('q', localQ || null)} className="btn btn-xs mt-2 rounded-full border-line bg-base-100">Apply search</button> : null}
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
 <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 font-medium text-[#B30A00]"><FiCalendar aria-hidden />{filtered.length} sessions</span>
 <span>·</span><span>{todayCount} today</span>
 {classFilter || statusFilter || q ? <button type="button" onClick={() => { setSearchParams(new URLSearchParams(view !== 'agenda' ? `view=${view}` : '')); setLocalQ(''); }} className="link link-hover text-brand">Clear filters</button> : null}
 </div>
 </Panel>

 <div className="grid gap-4 xl:grid-cols-12">
 <div className="xl:col-span-8">
 <Panel>
 {sessions.loading ? <LoadingBlock label="Loading schedule…" /> : sessions.error ? <ErrorBlock message={sessions.error} onRetry={sessions.refetch} /> : view === 'month' ? <MonthGrid anchor={anchor} onAnchor={setAnchor} sessions={filtered as never} onOpen={setDrawerId} onPickDay={(d) => { setAnchor(d); setView('agenda'); }} onCreateAtDate={(d) => { setEditingId(null); setDraftDate(format(d, 'yyyy-MM-dd')); setEditorOpen(true); }} /> : view === 'week' ? <WeekGrid anchor={anchor} sessions={filtered as never} onOpen={setDrawerId} onPickDay={(d) => { setAnchor(d); setView('agenda'); }} onCreateAtDate={(d) => { setEditingId(null); setDraftDate(format(d, 'yyyy-MM-dd')); setEditorOpen(true); }} /> : <AgendaGrouped sessions={filtered as never} onOpen={setDrawerId} onEdit={(id) => { setEditingId(id); setEditorOpen(true); }} onCancel={async (id) => { if (!confirm('Cancel this session? Students will be notified.')) return; try { const { apiPost } = await import('../../lib/api'); await apiPost(`/sessions/${id}/cancel`, { reason: 'Cancelled from schedule' }); sessions.refetch(); } catch (e) { alert(apiErrorMessage(e, 'Could not cancel.')); } }} />}
 </Panel>
 </div>
 <div className="space-y-4 xl:col-span-4">
 <Panel>
 <h3 className="flex items-center gap-2 text-sm font-bold"><FiCalendar aria-hidden className="text-brand" />Up next</h3>
 {filtered.length === 0 ? <EmptyBlock title="Nothing scheduled" hint="Schedule the first live class." /> : (
 <div className="mt-3 space-y-2">
 {filtered.slice(0, 3).map((s) => (
 <button key={s.id} type="button" onClick={() => setDrawerId(s.id)} className="w-full rounded-box border border-line bg-base-100 p-3 text-left hover:border-brand/20">
 <p className="truncate text-xs font-semibold">{s.title || 'Untitled'}</p>
 <p className="truncate text-[11px] text-muted">{s.classGroup?.name} · {format(parseISO(s.startAt), 'EEE d MMM, HH:mm')}</p>
 </button>
 ))}
 </div>
 )}
 </Panel>
 <Panel className="border-l-4 border-l-info bg-[#eff6ff]">
 <h4 className="text-xs font-bold">Admin tip</h4>
 <p className="mt-1 text-xs leading-snug text-muted">You see every class. Filter by class to focus — Month shows all sessions as colored chips, Agenda groups by day like Canvas.</p>
 </Panel>
 </div>
 </div>

 <SessionDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} session={drawerSession as never} onEdit={() => { setEditingId(drawerId); setDrawerId(null); setEditorOpen(true); }} onCancel={async () => { if (!drawerId || !confirm('Cancel this session? Students will be notified.')) return; try { const { apiPost } = await import('../../lib/api'); await apiPost(`/sessions/${drawerId}/cancel`, { reason: 'Cancelled from schedule' }); sessions.refetch(); setDrawerId(null); } catch (e) { alert(apiErrorMessage(e, 'Could not cancel.')); } }} onReschedule={() => { setEditingId(drawerId); setDrawerId(null); setEditorOpen(true); }} />

 <SessionEditorModal open={editorOpen} onClose={() => { setEditorOpen(false); setDraftDate(null); }} classes={(classes.data ?? []) as never} editing={editingSession ? { id: editingSession.id, title: editingSession.title, classGroupId: (editingSession as unknown as { classGroup: { id: string } }).classGroup?.id ?? classFilter ?? '', startAt: editingSession.startAt, endAt: editingSession.endAt, mode: editingSession.mode, provider: editingSession.provider, meetingUrl: editingSession.meetingUrl, room: (editingSession as unknown as { room: string | null }).room ?? null, notes: (editingSession as unknown as { notes: string | null }).notes ?? null } : null} initialDate={draftDate} onSaved={() => sessions.refetch()} />
 </div>
 );
}
