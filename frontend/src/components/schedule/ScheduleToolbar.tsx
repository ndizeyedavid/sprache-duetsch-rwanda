import { format } from 'date-fns';
import { FiChevronLeft,FiChevronRight,FiPlus } from 'react-icons/fi';
import type { ScheduleView } from './constants';
import { VIEWS,VIEW_LABEL } from './constants';
import { weekRangeLabel } from './utils';

type Props = { view: ScheduleView; onView: (v: ScheduleView) => void; anchor: Date; onPrev: () => void; onNext: () => void; onToday: () => void; onJump?: (d: Date) => void; onNew: () => void; canCreate: boolean };

const EYEBROW: Record<ScheduleView, string> = { day: 'Your day', week: 'Your week', month: 'Your month', agenda: 'All classes' };
const STEP_LABEL: Record<ScheduleView, string> = { day: 'day', week: 'week', month: 'month', agenda: 'week' };

function heading(view: ScheduleView, anchor: Date) {
  if (view === 'agenda') return 'All scheduled classes';
  if (view === 'month') return format(anchor, 'MMMM yyyy');
  if (view === 'day') return format(anchor, 'EEEE, d MMMM yyyy');
  return weekRangeLabel(anchor);
}

/** Title, prev/today/next, a date jump, the view switch and (staff) "New session". */
export function ScheduleToolbar({ view, onView, anchor, onPrev, onNext, onToday, onJump, onNew, canCreate }: Props) {
  return <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div><p className="text-[0.625rem] font-semibold uppercase tracking-widest text-muted">{EYEBROW[view]}</p><h2 className="mt-1 text-lg font-semibold">{heading(view, anchor)}</h2>
      <p className="mt-1 hidden text-[0.625rem] text-muted lg:block">Shortcuts: <kbd className="kbd kbd-xs">←</kbd> <kbd className="kbd kbd-xs">→</kbd> move · <kbd className="kbd kbd-xs">T</kbd> today · <kbd className="kbd kbd-xs">D</kbd> <kbd className="kbd kbd-xs">W</kbd> <kbd className="kbd kbd-xs">M</kbd> <kbd className="kbd kbd-xs">L</kbd> views</p></div>
    <div className="flex flex-wrap items-center gap-2 sm:gap-3">
      {view !== 'agenda' ? <div className="flex items-center gap-1">
        <button type="button" onClick={onPrev} aria-label={`Previous ${STEP_LABEL[view]}`} className="btn btn-ghost btn-sm btn-circle"><FiChevronLeft /></button>
        <button type="button" onClick={onToday} className="btn btn-sm rounded-full">Today</button>
        <button type="button" onClick={onNext} aria-label={`Next ${STEP_LABEL[view]}`} className="btn btn-ghost btn-sm btn-circle"><FiChevronRight /></button>
        {onJump ? <input type="date" aria-label="Jump to date" value={format(anchor, 'yyyy-MM-dd')}
          onChange={(event) => { if (event.target.value) onJump(new Date(`${event.target.value}T00:00:00`)); }}
          className="input input-sm ml-1 w-36 rounded-full" /> : null}
      </div> : null}
      <div className="flex gap-1 rounded-full bg-base-200 p-1" role="group" aria-label="Schedule view">{VIEWS.map(v => <button key={v} type="button" aria-pressed={view === v} onClick={() => onView(v)} className={`btn btn-sm rounded-full border-0 ${view === v ? 'btn-primary' : 'btn-ghost'}`}>{VIEW_LABEL[v]}</button>)}</div>
      {canCreate ? <button type="button" onClick={onNew} className="btn btn-primary btn-sm rounded-full"><FiPlus />New session</button> : null}
    </div>
  </div>;
}
