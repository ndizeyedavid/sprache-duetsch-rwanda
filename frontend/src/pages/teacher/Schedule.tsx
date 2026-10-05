import { useScheduleClock } from '../../components/schedule/useScheduleClock';
import { getTeacherSchedule } from '../../lib/schedule-api';
import { ScheduleSpotlight } from '../../components/schedule/ScheduleSpotlight';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Panel } from '../../components/ui/Panel';
import { ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { apiErrorMessage, apiPost } from '../../lib/api';
import { listClasses, getSession } from '../../lib/services';
import { ScheduleToolbar } from '../../components/schedule/ScheduleToolbar';
import { AgendaGrouped } from '../../components/schedule/AgendaGrouped';
import { MonthGrid } from '../../components/schedule/MonthGrid';
import { WeekGrid } from '../../components/schedule/WeekGrid';
import { SessionDetailDrawer } from '../../components/schedule/SessionDetailDrawer';
import { SessionEditorModal } from '../../components/schedule/SessionEditorModal';
import type { SessionMaterial } from '../../components/schedule/SessionMaterials';
import type { SessionItem } from '../../lib/services';
import { useScheduleNavigation } from '../../components/schedule/useScheduleNavigation';

export function TeacherSchedule() {
  useScheduleClock();
  const sessions = useApi('teacher-full-schedule', getTeacherSchedule);
  const classes = useApi('teacher-classes', listClasses);
  const nav = useScheduleNavigation();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const details = useApi(`staff-session-${drawerId ?? ''}`, () => getSession(drawerId!) as Promise<SessionItem & { materials: SessionMaterial[] }>, Boolean(drawerId));
  const all = sessions.data ?? [];
  const filtered = all.filter(s => nav.inRange(s.startAt)).sort((a,b) => Date.parse(a.startAt)-Date.parse(b.startAt));
  const selected = details.data?.id === drawerId && !details.stale ? details.data : all.find(s => s.id === drawerId) ?? null;
  const editing = all.find(s => s.id === editingId) ?? null;
  const editorClasses = useMemo(() => (classes.data ?? []).filter(c => c.isActive || c.id === editing?.classGroup?.id), [classes.data, editing?.classGroup?.id]);
  const editorSession = useMemo(() => editing ? { id:editing.id,title:editing.title,classGroupId:editing.classGroup?.id ?? '',startAt:editing.startAt,endAt:editing.endAt,mode:editing.mode,provider:editing.provider,meetingUrl:editing.meetingUrl,room:editing.room ?? null,notes:editing.notes ?? null,recordingUrl:editing.recordingUrl,status:editing.status } : null, [editing]);
  function create(day?: Date) { setEditingId(null); setDraftDate(day ? format(day,'yyyy-MM-dd') : null); setEditorOpen(true); }
  function edit(id: string) { setEditingId(id); setDrawerId(null); setEditorOpen(true); }
  async function cancel(id: string) {
    if (!confirm('Cancel this session? Students will be notified.')) return;
    setActionError('');
    try { await apiPost(`/sessions/${id}/cancel`, { reason:'Cancelled from schedule' }); sessions.refetch(); setDrawerId(null); }
    catch (e) { setActionError(apiErrorMessage(e,'Could not cancel this session.')); }
  }
  return <div className="space-y-4">
    <Panel><ScheduleSpotlight sessions={all} onOpen={setDrawerId} teacher /><p className="mb-4 text-xs text-base-content/55">Your classes · Times in {Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')}</p><ScheduleToolbar view={nav.view} onView={nav.setView} anchor={nav.anchor} onPrev={() => nav.step(-1)} onNext={() => nav.step(1)} onToday={() => nav.setAnchor(new Date())} onNew={() => create()} canCreate />
      <div className="mt-4 flex items-center gap-3 text-xs text-base-content/60"><span>{filtered.length} session{filtered.length === 1 ? '' : 's'} {nav.view === 'agenda' ? 'in total' : nav.view === 'month' ? 'this month' : 'this week'}</span></div>
    {actionError ? <div role="alert" className="alert alert-error text-sm">{actionError}<button className="btn btn-ghost btn-xs" onClick={() => setActionError('')}>Dismiss</button></div> : null}
    <div className="mt-5">{sessions.loading ? <LoadingBlock label="Loading schedule…" /> : sessions.error ? <ErrorBlock message={sessions.error} onRetry={sessions.refetch} /> : nav.view === 'month' ? <MonthGrid anchor={nav.anchor} onAnchor={nav.setAnchor} sessions={filtered} onOpen={setDrawerId} onPickDay={nav.pickDay} onCreateAtDate={create} /> : nav.view === 'week' ? <WeekGrid anchor={nav.anchor} sessions={filtered} onOpen={setDrawerId} onPickDay={nav.pickDay} onCreateAtDate={create} /> : <AgendaGrouped sessions={filtered} onOpen={setDrawerId} onEdit={edit} onCancel={cancel} />}</div></Panel>
    <SessionDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} onSaved={() => { details.refetch(); sessions.refetch(); }} session={selected ? { ...selected, room: selected.room ?? null, notes: selected.notes ?? null } : null} onEdit={() => { if(drawerId) edit(drawerId); }} onCancel={() => { if(drawerId) void cancel(drawerId); }} onReschedule={() => { if(drawerId) edit(drawerId); }} />
    <SessionEditorModal open={editorOpen} onClose={() => { setEditorOpen(false); setDraftDate(null); }} classes={editorClasses} editing={editorSession} initialDate={draftDate} onSaved={() => { sessions.refetch(); details.refetch(); }} />
  </div>;
}
