import { endOfDay,endOfWeek } from 'date-fns';
import type { ReactNode } from 'react';
import { useCallback } from 'react';
import { FiCalendar } from 'react-icons/fi';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { DayStrip } from './DayStrip';
import { MonthGrid } from './MonthGrid';
import { NextClassJump } from './NextClassJump';
import { ScheduleToolbar } from './ScheduleToolbar';
import { TimeGrid } from './time-grid/TimeGrid';
import type { GridSession } from './time-grid/layout';
import type { ScheduleNavigation } from './useScheduleNavigation';
import { useScheduleShortcuts } from './useScheduleShortcuts';
import { weekDays } from './utils';

type Props = {
  nav: ScheduleNavigation;
  sessions: GridSession[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onOpen: (id: string) => void;
  /** Staff: click an empty time slot (or a month day) to schedule a class there. */
  onCreateAt?: (start: Date) => void;
  /** Staff: quick Edit / Delete on each class in the time grid. */
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  /** The list view differs per role (staff can edit/cancel). */
  renderAgenda: (sessions: GridSession[]) => ReactNode;
};

const COUNT_SUFFIX = { day: 'on this day', week: 'this week', month: 'this month', agenda: 'in total' } as const;

/** Toolbar + the chosen view: time grid (day/week), month grid or list. Shared by students and staff. */
export function ScheduleCalendar({ nav, sessions, loading, error, onRetry, onOpen, onCreateAt, onEdit, onDelete, renderAgenda }: Props) {
  const { view, anchor } = nav;
  const filtered = sessions.filter((s) => nav.inRange(s.startAt)).sort((a, b) => Date.parse(a.startAt) - Date.parse(b.startAt));
  const prev = useCallback(() => nav.step(-1), [nav]);
  const next = useCallback(() => nav.step(1), [nav]);
  const today = useCallback(() => nav.setAnchor(new Date()), [nav]);
  useScheduleShortcuts({ onPrev: prev, onNext: next, onToday: today, onView: nav.setView });
  const rangeEnd = view === 'day' ? endOfDay(anchor) : view === 'week' ? endOfWeek(anchor, { weekStartsOn: 1 }) : null;

  return (
    <>
      <ScheduleToolbar view={view} onView={nav.setView} anchor={anchor} onPrev={prev} onNext={next} onToday={today} onJump={nav.setAnchor} onNew={() => {}} canCreate={false} />
      <div className="mt-3 flex flex-wrap items-center gap-2 text-[0.6875rem] text-muted">
        <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2.5 py-1 font-medium">
          <FiCalendar aria-hidden />{filtered.length} class{filtered.length === 1 ? '' : 'es'} {COUNT_SUFFIX[view]}
        </span>
        {rangeEnd ? <NextClassJump sessions={sessions} after={rangeEnd} onJump={nav.pickDay} /> : null}
      </div>
      {view === 'day' ? <div className="mt-4"><DayStrip anchor={anchor} sessions={sessions} onPick={nav.setAnchor} /></div> : null}
      <div className="mt-4 min-w-0">
        {loading ? <LoadingBlock label="Loading schedule…" />
          : error ? <ErrorBlock message={error} onRetry={onRetry} />
            : view === 'day' || view === 'week'
              ? <TimeGrid days={view === 'day' ? [anchor] : weekDays(anchor)} sessions={filtered} onOpen={onOpen} onPickDay={nav.pickDay} onCreateAt={onCreateAt} onEdit={onEdit} onDelete={onDelete} />
              : view === 'month'
                ? <MonthGrid anchor={anchor} onAnchor={nav.setAnchor} sessions={filtered} onOpen={onOpen} onPickDay={nav.pickDay} onCreateAtDate={onCreateAt} />
                : renderAgenda(filtered)}
      </div>
    </>
  );
}
