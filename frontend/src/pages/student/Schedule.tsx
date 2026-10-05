import { useScheduleClock } from '../../components/schedule/useScheduleClock';
import { getStudentSchedule } from '../../lib/schedule-api';
import { ScheduleSpotlight } from '../../components/schedule/ScheduleSpotlight';
import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, addMonths, endOfWeek, format, isValid, parseISO, startOfWeek, subDays, subMonths } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { getUpcomingSessions } from '../../lib/services';
import { ScheduleToolbar } from '../../components/schedule/ScheduleToolbar';
import { StudentAgendaGrouped } from '../../components/schedule/StudentAgendaGrouped';
import { MonthGrid } from '../../components/schedule/MonthGrid';
import { WeekGrid } from '../../components/schedule/WeekGrid';
import { StudentDetailDrawer } from '../../components/schedule/StudentDetailDrawer';
import type { ScheduleView } from '../../components/schedule/constants';

export function Schedule() {
  useScheduleClock();
  const [searchParams, setSearchParams] = useSearchParams();
  const upcoming = useApi('upcoming-sessions', getUpcomingSessions);
  const history = useApi('student-full-schedule', getStudentSchedule);

  const view: ScheduleView = searchParams.get('view') === 'agenda' ? 'agenda' : searchParams.get('view') === 'week' ? 'week' : 'month';
  const dateParam = searchParams.get('date');
  const anchor = useMemo(() => { const d = dateParam ? parseISO(dateParam) : new Date(); return isValid(d) ? d : new Date(); }, [dateParam]);

  const [drawerId, setDrawerId] = useState<string | null>(null);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  }
  function setView(v: ScheduleView) { setParam('view', v === 'month' ? null : v); }
  function setAnchor(d: Date) { setParam('date', format(d, 'yyyy-MM-dd')); }
  function step(dir: number) {
    if (view === 'month') setAnchor(dir > 0 ? addMonths(anchor, 1) : subMonths(anchor, 1));
    else if (view === 'week') setAnchor(dir > 0 ? addDays(anchor, 7) : subDays(anchor, 7));
    else setAnchor(dir > 0 ? addDays(anchor, 7) : subDays(anchor, 7));
  }

  const allSessions = useMemo(() => {
    const a = (upcoming.data ?? []) as unknown as { id: string; title: string; startAt: string; endAt: string; status: string; mode: string; provider: string | null; timezone: string | null; meetingUrl: string | null; room?: string | null; notes?: string | null; teacher: { firstName: string; lastName: string } | null; classGroup: { id: string; name: string } | null }[];
    const bRaw = history.data as unknown;
    const b = Array.isArray(bRaw) ? (bRaw as typeof a) : Array.isArray((bRaw as { data?: typeof a })?.data) ? ((bRaw as { data: typeof a }).data) : [];
    const map = new Map<string, (typeof a)[number]>();
    for (const s of [...a, ...b]) map.set(s.id, s);
    return [...map.values()];
  }, [upcoming.data, history.data]);

  const filtered = useMemo(() => {
    const list = [...allSessions];
    list.sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
    if (view === 'agenda') return list;
    if (view === 'week') {
      const start = startOfWeek(anchor, { weekStartsOn: 1 });
      start.setHours(0, 0, 0, 0);
      const end = endOfWeek(anchor, { weekStartsOn: 1 });
      end.setHours(23, 59, 59, 999);
      return list.filter((s) => {
        const d = new Date(s.startAt);
        return d >= start && d <= end;
      });
    }
    const m = anchor.getMonth();
    const y = anchor.getFullYear();
    return list.filter((s) => {
      const d = new Date(s.startAt);
      return d.getMonth() === m && d.getFullYear() === y;
    });
  }, [allSessions, view, anchor]);

  const drawerSession = useMemo(() => allSessions.find((s) => s.id === drawerId) ?? null, [allSessions, drawerId]);
  const loading = upcoming.loading || history.loading;
  const error = upcoming.error || history.error;

  return (
    <div className="space-y-4">
      <Panel>
        <ScheduleSpotlight sessions={allSessions} onOpen={setDrawerId} />
        <p className="mb-4 text-xs text-base-content/55">Your classes · Times in {Intl.DateTimeFormat().resolvedOptions().timeZone.replaceAll('_', ' ')}</p>
        <ScheduleToolbar view={view} onView={setView} anchor={anchor} onPrev={() => step(-1)} onNext={() => step(1)} onToday={() => setAnchor(new Date())} onNew={() => {}} canCreate={false} />
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2.5 py-1 font-medium text-base-content/65">
            <FiCalendar aria-hidden />
            {filtered.length} session{filtered.length === 1 ? '' : 's'}
          </span>

        </div>
        <div className="mt-5 min-w-0">
            {loading ? (
              <LoadingBlock label="Loading schedule…" />
            ) : error ? (
              <ErrorBlock message={error} onRetry={() => { upcoming.refetch(); history.refetch(); }} />
            ) : view === 'month' ? (
              <MonthGrid anchor={anchor} onAnchor={setAnchor} sessions={filtered as never} onOpen={setDrawerId} onPickDay={(d) => { const next = new URLSearchParams(searchParams); next.set('date', format(d, 'yyyy-MM-dd')); next.set('view', 'week'); setSearchParams(next); }} />
            ) : view === 'week' ? (
              <WeekGrid anchor={anchor} sessions={filtered as never} onOpen={setDrawerId} onPickDay={(d) => { const next = new URLSearchParams(searchParams); next.set('date', format(d, 'yyyy-MM-dd')); next.set('view', 'week'); setSearchParams(next); }} />
            ) : (
              <StudentAgendaGrouped sessions={filtered as never} onOpen={setDrawerId} />
            )}
        </div>
      </Panel>

      <StudentDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} session={drawerSession as never} />
    </div>
  );
}
