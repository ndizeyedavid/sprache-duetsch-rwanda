import { useMemo,useState } from 'react';
import { ScheduleCalendar } from '../../components/schedule/ScheduleCalendar';
import { StudentAgendaGrouped } from '../../components/schedule/StudentAgendaGrouped';
import { StudentDetailDrawer } from '../../components/schedule/StudentDetailDrawer';
import { StudentScheduleHero } from '../../components/schedule/StudentScheduleHero';
import { useScheduleClock } from '../../components/schedule/useScheduleClock';
import { useScheduleNavigation } from '../../components/schedule/useScheduleNavigation';
import { Panel } from '../../components/ui/Panel';
import { useApi } from '../../hooks/useApi';
import { getStudentSchedule } from '../../lib/schedule-api';
import { getUpcomingSessions } from '../../lib/services';

type StudentSession = {
  id: string; title: string; startAt: string; endAt: string; status: string; mode: string; provider: string | null;
  timezone: string | null; meetingUrl: string | null; room?: string | null; notes?: string | null;
  teacher: { firstName: string; lastName: string } | null; classGroup: { id: string; name: string } | null;
};

/** Upcoming + past classes merged by id (the history endpoint may return a bare array or a page). */
function mergeSessions(upcoming: unknown, history: unknown): StudentSession[] {
  const list = (value: unknown): StudentSession[] => Array.isArray(value) ? value as StudentSession[]
    : Array.isArray((value as { data?: unknown })?.data) ? (value as { data: StudentSession[] }).data : [];
  const map = new Map<string, StudentSession>();
  for (const session of [...list(upcoming), ...list(history)]) map.set(session.id, session);
  return [...map.values()];
}

export function Schedule() {
  useScheduleClock();
  const nav = useScheduleNavigation();
  const upcoming = useApi('upcoming-sessions', getUpcomingSessions);
  const history = useApi('student-full-schedule', getStudentSchedule);
  const [drawerId, setDrawerId] = useState<string | null>(null);
  const allSessions = useMemo(() => mergeSessions(upcoming.data, history.data), [upcoming.data, history.data]);
  const drawerSession = allSessions.find((s) => s.id === drawerId) ?? null;
  const loading = upcoming.loading || history.loading;

  return (
    <div className="space-y-4">
      <StudentScheduleHero sessions={allSessions} loading={loading} onOpen={setDrawerId} />
      <Panel>
        <ScheduleCalendar nav={nav} sessions={allSessions} loading={loading} error={upcoming.error || history.error}
          onRetry={() => { upcoming.refetch(); history.refetch(); }} onOpen={setDrawerId}
          renderAgenda={(list) => <StudentAgendaGrouped sessions={list as never} onOpen={setDrawerId} />} />
      </Panel>
      <StudentDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} session={drawerSession as never} />
    </div>
  );
}
