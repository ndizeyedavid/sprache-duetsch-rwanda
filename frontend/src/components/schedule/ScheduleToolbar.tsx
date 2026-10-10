import { format } from 'date-fns';
import { FiChevronLeft,FiChevronRight,FiPlus } from 'react-icons/fi';
import type { ScheduleView } from './constants';
import { VIEWS,VIEW_LABEL } from './constants';
import { weekRangeLabel } from './utils';
type Props = { view: ScheduleView; onView: (v: ScheduleView) => void; anchor: Date; onPrev: () => void; onNext: () => void; onToday: () => void; onNew: () => void; canCreate: boolean };
export function ScheduleToolbar({ view, onView, anchor, onPrev, onNext, onToday, onNew, canCreate }: Props) {
  return <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
    <div><p className="text-[10px] font-semibold uppercase tracking-widest text-muted">{view === 'agenda' ? 'All classes' : view === 'month' ? 'Your month' : 'Your week'}</p><h2 className="mt-1 text-lg font-semibold">{view === 'agenda' ? 'All scheduled classes' : view === 'month' ? format(anchor, 'MMMM yyyy') : weekRangeLabel(anchor)}</h2></div>
    <div className="flex flex-wrap items-center gap-3">
      {view !== 'agenda' ? <div className="flex items-center gap-1"><button type="button" onClick={onPrev} aria-label={view === 'month' ? 'Previous month' : 'Previous week'} className="btn btn-ghost btn-sm btn-circle"><FiChevronLeft /></button><button type="button" onClick={onToday} className="btn btn-sm rounded-full">Today</button><button type="button" onClick={onNext} aria-label={view === 'month' ? 'Next month' : 'Next week'} className="btn btn-ghost btn-sm btn-circle"><FiChevronRight /></button></div> : null}
      <div className="flex gap-1 rounded-full bg-base-200 p-1" aria-label="Schedule view">{VIEWS.map(v => <button key={v} type="button" aria-pressed={view === v} onClick={() => onView(v)} className={`btn btn-sm rounded-full border-0 ${view === v ? 'btn-neutral' : 'btn-ghost'}`}>{VIEW_LABEL[v]}</button>)}</div>
      {canCreate ? <button type="button" onClick={onNew} className="btn btn-primary btn-sm rounded-full"><FiPlus />New session</button> : null}
    </div>
  </div>;
}
