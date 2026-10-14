import { format } from 'date-fns';
import { useMemo,useState } from 'react';
import { ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { AgendaGrouped } from '../../components/schedule/AgendaGrouped';
import { CancelSessionDialog } from '../../components/schedule/CancelSessionDialog';
import { MonthGrid } from '../../components/schedule/MonthGrid';
import { RescheduleSessionDialog } from '../../components/schedule/RescheduleSessionDialog';
import { ScheduleSpotlight } from '../../components/schedule/ScheduleSpotlight';
import { ScheduleToolbar } from '../../components/schedule/ScheduleToolbar';
import { SessionDetailDrawer } from '../../components/schedule/SessionDetailDrawer';
import { SessionEditorModal } from '../../components/schedule/SessionEditorModal';
import type { SessionMaterial } from '../../components/schedule/SessionMaterials';
import { useScheduleClock } from '../../components/schedule/useScheduleClock';
import { useScheduleNavigation } from '../../components/schedule/useScheduleNavigation';
import { WeekGrid } from '../../components/schedule/WeekGrid';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getTeacherSchedule } from '../../lib/schedule-api';
import type { SessionItem } from '../../lib/services';
import { getSession,listClasses } from '../../lib/services';

export function TeacherSchedule() {
  useScheduleClock();
  const sessions = useApi('teacher-full-schedule', getTeacherSchedule);
  const classes = useApi('teacher-classes', listClasses);
  const nav = useScheduleNavigation();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const details = useApi(`staff-session-${drawerId ?? ''}`, () => getSession(drawerId!) as Promise<SessionItem & { materials: SessionMaterial[] }>, Boolean(drawerId));
  const all = sessions.data ?? [];
  const filtered = all.filter(s => nav.inRange(s.startAt)).sort((a,b) => Date.parse(a.startAt)-Date.parse(b.startAt));
  const selected = details.data?.id === drawerId && !details.stale ? details.data : all.find(s => s.id === drawerId) ?? null;
  const editing = all.find(s => s.id === editingId) ?? null;
  const editorClasses = useMemo(() => (classes.data ?? []).filter(c => c.isActive || c.id === editing?.classGroup?.id), [classes.data, editing?.classGroup?.id]);
  const editorSession = useMemo(() => editing ? { id:editing.id,title:editing.title,classGroupId:editing.classGroup?.id ?? '',startAt:editing.startAt,endAt:editing.endAt,mode:editing.mode,provider:editing.provider,meetingUrl:editing.meetingUrl,room:editing.room ?? null,notes:editing.notes ?? null,recordingUrl:editing.recordingUrl,status:editing.status } : null, [editing]);
  function create(day?: Date) { setEditingId(null); setDraftDate(day ? format(day,'yyyy-MM-dd') : null); setEditorOpen(true); }
  function edit(id: string) { setEditingId(id); setDrawerId(null); setEditorOpen(true); }
  const cancelTarget = all.find(s => s.id === cancelId) ?? null;
  const rescheduleTarget = all.find(s => s.id === rescheduleId) ?? null;
  function actionDone() { setCancelId(null); setRescheduleId(null); setDrawerId(null); sessions.refetch(); }
  return <div className="space-y-4">
    <Panel><ScheduleSpotlight sessions={all} onOpen={setDrawerId} teacher /><p className="mb-4 text-xs text-muted">Your classes · Calendar in {Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')} · class details use each class's timezone</p><ScheduleToolbar view={nav.view} onView={nav.setView} anchor={nav.anchor} onPrev={() => nav.step(-1)} onNext={() => nav.step(1)} onToday={() => nav.setAnchor(new Date())} onNew={() => create()} canCreate />
      <div className="mt-4 flex items-center gap-3 text-xs text-muted"><span>{filtered.length} session{filtered.length === 1 ? '' : 's'} {nav.view === 'agenda' ? 'in total' : nav.view === 'month' ? 'this month' : 'this week'}</span></div>
    <div className="mt-5">{sessions.loading ? <LoadingBlock label="Loading schedule…" /> : sessions.error ? <ErrorBlock message={sessions.error} onRetry={sessions.refetch} /> : nav.view === 'month' ? <MonthGrid anchor={nav.anchor} onAnchor={nav.setAnchor} sessions={filtered} onOpen={setDrawerId} onPickDay={nav.pickDay} onCreateAtDate={create} /> : nav.view === 'week' ? <WeekGrid anchor={nav.anchor} sessions={filtered} onOpen={setDrawerId} onPickDay={nav.pickDay} onCreateAtDate={create} /> : <AgendaGrouped sessions={filtered} onOpen={setDrawerId} onEdit={edit} onCancel={setCancelId} />}</div></Panel>
    <SessionDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} onSaved={() => { details.refetch(); sessions.refetch(); }} session={selected ? { ...selected, room: selected.room ?? null, notes: selected.notes ?? null } : null} onEdit={() => { if(drawerId) edit(drawerId); }} onCancel={() => setCancelId(drawerId)} onReschedule={() => setRescheduleId(drawerId)} />
    <CancelSessionDialog session={cancelTarget} onClose={() => setCancelId(null)} onDone={actionDone} />
    <RescheduleSessionDialog session={rescheduleTarget} onClose={() => setRescheduleId(null)} onDone={actionDone} />
    <SessionEditorModal open={editorOpen} onClose={() => { setEditorOpen(false); setDraftDate(null); }} classes={editorClasses} editing={editorSession} initialDate={draftDate} onSaved={() => { sessions.refetch(); details.refetch(); }} />
  </div>;
}
