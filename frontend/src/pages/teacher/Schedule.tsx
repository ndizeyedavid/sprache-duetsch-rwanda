import { format } from 'date-fns';
import { useMemo,useState } from 'react';
import { AgendaGrouped } from '../../components/schedule/AgendaGrouped';
import { CancelSessionDialog } from '../../components/schedule/CancelSessionDialog';
import { DeleteSessionDialog } from '../../components/schedule/DeleteSessionDialog';
import { RescheduleSessionDialog } from '../../components/schedule/RescheduleSessionDialog';
import { ScheduleCalendar } from '../../components/schedule/ScheduleCalendar';
import { SessionDetailDrawer } from '../../components/schedule/SessionDetailDrawer';
import { SessionEditorModal } from '../../components/schedule/SessionEditorModal';
import type { SessionMaterial } from '../../components/schedule/SessionMaterials';
import { TeacherScheduleHero } from '../../components/schedule/TeacherScheduleHero';
import { useScheduleClock } from '../../components/schedule/useScheduleClock';
import { useScheduleNavigation } from '../../components/schedule/useScheduleNavigation';
import { useStaffPortal } from '../../components/teacher/useStaffPortal';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getTeacherSchedule } from '../../lib/schedule-api';
import type { SessionItem } from '../../lib/services';
import { getSession,listClasses } from '../../lib/services';

export function TeacherSchedule() {
  useScheduleClock();
  const { admin } = useStaffPortal();
  const sessions = useApi('teacher-full-schedule', getTeacherSchedule);
  const classes = useApi('teacher-classes', listClasses);
  const nav = useScheduleNavigation();
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftDate, setDraftDate] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const details = useApi(`staff-session-${drawerId ?? ''}`, () => getSession(drawerId!) as Promise<SessionItem & { materials: SessionMaterial[] }>, Boolean(drawerId));
  const all = sessions.data ?? [];
  const selected = details.data?.id === drawerId && !details.stale ? details.data : all.find(s => s.id === drawerId) ?? null;
  const editing = all.find(s => s.id === editingId) ?? null;
  const editorClasses = useMemo(() => (classes.data ?? []).filter(c => c.isActive || c.id === editing?.classGroup?.id), [classes.data, editing?.classGroup?.id]);
  const editorSession = useMemo(() => editing ? { id:editing.id,title:editing.title,classGroupId:editing.classGroup?.id ?? '',startAt:editing.startAt,endAt:editing.endAt,mode:editing.mode,provider:editing.provider,meetingUrl:editing.meetingUrl,room:editing.room ?? null,notes:editing.notes ?? null,recordingUrl:editing.recordingUrl,status:editing.status } : null, [editing]);
  // A clicked time slot carries its time; a month day (midnight) only its date.
  function create(at?: Date) { setEditingId(null); setDraftDate(at ? format(at, at.getHours() || at.getMinutes() ? "yyyy-MM-dd'T'HH:mm" : 'yyyy-MM-dd') : null); setEditorOpen(true); }
  function edit(id: string) { setEditingId(id); setDrawerId(null); setEditorOpen(true); }
  const cancelTarget = all.find(s => s.id === cancelId) ?? null;
  const rescheduleTarget = all.find(s => s.id === rescheduleId) ?? null;
  const deleteTarget = all.find(s => s.id === deleteId) ?? null;
  // Delete closes whatever led to it (drawer or editor) so the confirmation stands alone.
  const askDelete = (id: string) => { setDrawerId(null); setEditorOpen(false); setDeleteId(id); };
  function actionDone() { setCancelId(null); setRescheduleId(null); setDeleteId(null); setDrawerId(null); sessions.refetch(); }
  return <div className="space-y-4">
    <TeacherScheduleHero sessions={all} onOpen={setDrawerId} onNew={() => create()} admin={admin} />
    <Panel>
      <ScheduleCalendar nav={nav} sessions={all} loading={sessions.loading} error={sessions.error} onRetry={sessions.refetch} onOpen={setDrawerId} onCreateAt={create} onEdit={edit} onDelete={askDelete}
        renderAgenda={(list) => { const ids = new Set(list.map(item => item.id)); return <AgendaGrouped sessions={all.filter(s => ids.has(s.id))} onOpen={setDrawerId} onEdit={edit} onCancel={setCancelId} onDelete={askDelete} />; }} />
    </Panel>
    <SessionDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} onSaved={() => { details.refetch(); sessions.refetch(); }} session={selected ? { ...selected, room: selected.room ?? null, notes: selected.notes ?? null } : null} onEdit={() => { if(drawerId) edit(drawerId); }} onCancel={() => setCancelId(drawerId)} onReschedule={() => setRescheduleId(drawerId)} onDelete={() => { if (drawerId) askDelete(drawerId); }} />
    <CancelSessionDialog session={cancelTarget} onClose={() => setCancelId(null)} onDone={actionDone} />
    <DeleteSessionDialog session={deleteTarget ? { ...deleteTarget, title: deleteTarget.title ?? '' } : null} onClose={() => setDeleteId(null)} onDone={actionDone} />
    <RescheduleSessionDialog session={rescheduleTarget} onClose={() => setRescheduleId(null)} onDone={actionDone} />
    <SessionEditorModal open={editorOpen} onClose={() => { setEditorOpen(false); setDraftDate(null); }} classes={editorClasses} editing={editorSession} initialDate={draftDate} onSaved={() => { sessions.refetch(); details.refetch(); }} onDelete={askDelete} />
  </div>;
}
