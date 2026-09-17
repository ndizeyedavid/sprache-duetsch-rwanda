import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format } from 'date-fns';
import { VIEWS, VIEW_LABEL } from './constants';
import type { ScheduleView } from './constants';

type Props = {
 view: ScheduleView;
 onView: (v: ScheduleView) => void;
 anchor: Date;
 onPrev: () => void;
 onNext: () => void;
 onToday: () => void;
 onNew: () => void;
 canCreate: boolean;
};

export function ScheduleToolbar({ view, onView, anchor, onPrev, onNext, onToday, onNew, canCreate }: Props) {
 const title = view === 'month' ? format(anchor, 'MMMM yyyy') : view === 'week' ? `${format(anchor, 'MMM d')} · Week` : format(anchor, 'EEEE, d MMMM yyyy');
 return (
 <div className="flex flex-wrap items-center gap-2">
 <div className="flex items-center gap-1">
 <button type="button" onClick={onToday} className="btn btn-sm rounded-full border-line bg-base-100">Today</button>
 <button type="button" onClick={onPrev} aria-label="Previous" className="btn btn-ghost btn-sm btn-circle"><FiChevronLeft aria-hidden /></button>
 <button type="button" onClick={onNext} aria-label="Next" className="btn btn-ghost btn-sm btn-circle"><FiChevronRight aria-hidden /></button>
 <span className="ml-2 text-sm font-semibold">{title}</span>
 </div>
 <div className="ml-auto flex items-center gap-2">
 <div className="tabs tabs-boxed bg-base-200 p-1">
 {VIEWS.map((v) => (
 <button key={v} type="button" onClick={() => onView(v)} className={`tab tab-sm ${view === v ? 'tab-active bg-brand text-white' : ''}`}>{VIEW_LABEL[v]}</button>
 ))}
 </div>
 {canCreate ? <button type="button" onClick={onNew} className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90">New session</button> : null}
 </div>
 </div>
 );
}
