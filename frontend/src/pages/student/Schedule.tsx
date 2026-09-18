import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, addMonths, endOfWeek, format, isSameDay, parseISO, startOfWeek, subDays, subMonths } from 'date-fns';
import { FiCalendar, FiSearch, FiX, FiVideo, FiInfo } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { getMySessions, getUpcomingSessions } from '../../lib/services';
import { ScheduleToolbar } from '../../components/schedule/ScheduleToolbar';
import { StudentAgendaGrouped } from '../../components/schedule/StudentAgendaGrouped';
import { MonthGrid } from '../../components/schedule/MonthGrid';
import { WeekGrid } from '../../components/schedule/WeekGrid';
import { StudentDetailDrawer } from '../../components/schedule/StudentDetailDrawer';
import type { ScheduleView } from '../../components/schedule/constants';

export function Schedule() {
  const [searchParams, setSearchParams] = useSearchParams();
  const upcoming = useApi('upcoming-sessions', getUpcomingSessions);
  const history = useApi('my-sessions', getMySessions);

  const view = (searchParams.get('view') as ScheduleView) || 'agenda';
  const dateParam = searchParams.get('date');
  const anchor = useMemo(() => (dateParam ? parseISO(dateParam) : new Date()), [dateParam]);
  const statusFilter = searchParams.get('status') || '';
  const q = searchParams.get('q') || '';

  const [localQ, setLocalQ] = useState(q);
  const [drawerId, setDrawerId] = useState<string | null>(null);

  // Keep input in sync when URL changes via back/forward or Clear filters
  useMemo(() => { setLocalQ(q); return undefined; }, [q]);

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') next.delete(key);
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

  const allSessions = useMemo(() => {
    const a = (upcoming.data ?? []) as unknown as { id: string; title: string; startAt: string; endAt: string; status: string; mode: string; provider: string | null; timezone: string | null; meetingUrl: string | null; room?: string | null; notes?: string | null; teacher: { firstName: string; lastName: string } | null; classGroup: { id: string; name: string } | null }[];
    const bRaw = history.data as unknown;
    const b = Array.isArray(bRaw) ? (bRaw as typeof a) : Array.isArray((bRaw as { data?: typeof a })?.data) ? ((bRaw as { data: typeof a }).data) : [];
    const map = new Map<string, (typeof a)[number]>();
    for (const s of [...a, ...b]) map.set(s.id, s);
    return [...map.values()];
  }, [upcoming.data, history.data]);

  const filtered = useMemo(() => {
    let list = [...allSessions];
    if (statusFilter) list = list.filter((s) => s.status === statusFilter);
    if (q) {
      const needle = q.trim().toLowerCase();
      list = list.filter((s) => `${s.title} ${s.classGroup?.name ?? ''} ${s.teacher ? `${s.teacher.firstName} ${s.teacher.lastName}` : ''}`.toLowerCase().includes(needle));
    }
    if (view === 'agenda') {
      return list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    }
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
  }, [allSessions, statusFilter, q, view, anchor]);

  const drawerSession = useMemo(() => allSessions.find((s) => s.id === drawerId) ?? null, [allSessions, drawerId]);
  const loading = upcoming.loading || history.loading;
  const error = upcoming.error || history.error;

  const todayCount = allSessions.filter((s) => isSameDay(parseISO(s.startAt), new Date())).length;
  const liveCount = allSessions.filter((s) => s.status === 'LIVE').length;

  return (
    <div className="space-y-4">
      <Panel>
        <ScheduleToolbar view={view} onView={setView} anchor={anchor} onPrev={() => step(-1)} onNext={() => step(1)} onToday={() => setAnchor(new Date())} onNew={() => {}} canCreate={false} />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <div className="relative">
            <FiSearch aria-hidden className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={localQ}
              onChange={(e) => setLocalQ(e.currentTarget.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') setParam('q', localQ || null); }}
              placeholder="Search title, class or teacher…"
              className="input input-sm rounded-full border-line bg-base-100 pl-9 pr-8"
            />
            {localQ ? (
              <button type="button" onClick={() => { setLocalQ(''); setParam('q', null); }} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1/2 -translate-y-1/2" aria-label="Clear search">
                <FiX aria-hidden />
              </button>
            ) : null}
          </div>
          <button type="button" onClick={() => setParam('q', localQ || null)} className="btn btn-xs rounded-full border-line bg-base-100">
            Search
          </button>
          <select value={statusFilter} onChange={(e) => setParam('status', e.currentTarget.value || null)} className="select select-sm rounded-full border-line bg-base-100">
            <option value="">All statuses</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RESCHEDULED">Rescheduled</option>
          </select>
          {(q || statusFilter) ? (
            <button type="button" onClick={() => { setLocalQ(''); setParam('q', null); setParam('status', null); }} className="btn btn-xs rounded-full border-line bg-base-100">
              Clear filters
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] text-muted">
          <span className="inline-flex items-center gap-1 rounded-full bg-brand-soft px-2.5 py-1 font-medium text-[#B30A00]">
            <FiCalendar aria-hidden />
            {filtered.length} session{filtered.length === 1 ? '' : 's'}
          </span>
          <span>·</span>
          <span>{todayCount} today</span>
          {liveCount ? (
            <>
              <span>·</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-coral-soft px-2.5 py-1 font-medium text-coral">
                <FiVideo aria-hidden />
                {liveCount} live
              </span>
            </>
          ) : null}
        </div>
      </Panel>

      <div className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <Panel>
            {loading ? (
              <LoadingBlock label="Loading schedule…" />
            ) : error ? (
              <ErrorBlock message={error} onRetry={() => { upcoming.refetch(); history.refetch(); }} />
            ) : view === 'month' ? (
              <MonthGrid anchor={anchor} onAnchor={setAnchor} sessions={filtered as never} onOpen={setDrawerId} onPickDay={(d) => { setAnchor(d); setView('agenda'); }} />
            ) : view === 'week' ? (
              <WeekGrid anchor={anchor} sessions={filtered as never} onOpen={setDrawerId} onPickDay={(d) => { setAnchor(d); setView('agenda'); }} />
            ) : (
              <StudentAgendaGrouped sessions={filtered as never} onOpen={setDrawerId} />
            )}
          </Panel>
        </div>
        <div className="space-y-4 xl:col-span-4">
          <Panel>
            <h3 className="flex items-center gap-2 text-sm font-bold">
              <FiCalendar aria-hidden className="text-brand" />
              Up next
            </h3>
            {filtered.length === 0 ? (
              <EmptyBlock title="Nothing scheduled" hint="Your teacher will schedule the next live class — it will appear here with its link, time and teacher." />
            ) : (
              <div className="mt-3 space-y-2">
                {filtered
                  .filter((s) => new Date(s.startAt).getTime() >= Date.now() - 60 * 60 * 1000)
                  .slice(0, 3)
                  .map((s) => (
                    <button key={s.id} type="button" onClick={() => setDrawerId(s.id)} className="w-full rounded-box border border-line bg-base-100 p-3 text-left hover:border-brand/20">
                      <p className="truncate text-xs font-semibold">{s.title || 'Untitled'}</p>
                      <p className="truncate text-[11px] text-muted">
                        {s.classGroup?.name ?? '—'} · {format(parseISO(s.startAt), 'EEE d MMM, HH:mm')}
                      </p>
                    </button>
                  ))}
                {filtered.filter((s) => new Date(s.startAt).getTime() >= Date.now() - 60 * 60 * 1000).length === 0 ? <p className="text-xs text-muted">No upcoming in this view — try All or change the date.</p> : null}
              </div>
            )}
            <div className="mt-3 rounded-box bg-base-200/50 p-3">
              <p className="flex items-center gap-1.5 text-xs font-semibold">
                <FiInfo aria-hidden className="text-brand" />
                Need help?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted">Class links appear here once your teacher schedules a live session. Essential info (link, time, teacher) always renders, even when other media fails.</p>
            </div>
          </Panel>
        </div>
      </div>

      <StudentDetailDrawer open={Boolean(drawerId)} onClose={() => setDrawerId(null)} session={drawerSession as never} />
    </div>
  );
}
