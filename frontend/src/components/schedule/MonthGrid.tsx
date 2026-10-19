import { eachDayOfInterval,endOfMonth,endOfWeek,format,isBefore,isSameMonth,isToday,startOfDay,startOfMonth,startOfWeek } from 'date-fns';
import { FiPlus } from 'react-icons/fi';
import { sessionStatusLabel } from '../../lib/sessions-ui';
import { STATUS_BLOCK } from './time-grid/constants';

type Session = { id: string; title: string; startAt: string; status: string };

type Props = { anchor: Date; onAnchor: (d: Date) => void; sessions: Session[]; onOpen: (id: string) => void; onPickDay: (d: Date) => void; onCreateAtDate?: (d: Date) => void };

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function grid(anchor: Date): Date[] {
 return eachDayOfInterval({ start: startOfWeek(startOfMonth(anchor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(anchor), { weekStartsOn: 1 }) });
}

export function MonthGrid({ anchor, sessions, onOpen, onPickDay, onCreateAtDate }: Props) {
 const days = grid(anchor);
 return (
 <div>
 <div className="grid grid-cols-7 gap-1 sm:gap-2">
 {WEEKDAYS.map((w) => (
 <div key={w} className="px-1 py-2 text-center text-[0.6875rem] font-semibold text-muted">{w}</div>
 ))}
 {days.map((day) => {
 const inMonth = isSameMonth(day, anchor);
 const daySessions = sessions.filter((s) => new Date(s.startAt).toDateString() === day.toDateString());
 const isTodayFlag = isToday(day);
 const past = isBefore(day, startOfDay(new Date()));
 return (
 <div key={day.toISOString()} role="button" tabIndex={0} onClick={() => onPickDay(day)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onPickDay(day); }} className={`group relative min-h-24 min-w-0 cursor-pointer rounded-xl bg-base-200 p-1.5 text-left ${!inMonth ? 'opacity-40' : ''} hover:bg-base-200`}>
 <div className="flex items-center justify-between">
 <span className={`inline-flex size-6 items-center justify-center rounded-full text-xs ${isTodayFlag ? 'bg-brand font-bold text-white' : 'font-medium'}`}>{day.getDate()}</span>
 {onCreateAtDate && !past ? (
 <button
 type="button"
 aria-label={`Create session on ${format(day, 'd MMMM yyyy')}`}
 onClick={(e) => { e.stopPropagation(); onCreateAtDate(day); }}
 className="btn btn-ghost btn-xs btn-circle size-6 hidden sm:inline-flex hover:bg-neutral hover:text-neutral-content"
 >
 <FiPlus aria-hidden className="text-xs" />
 </button>
 ) : null}
 </div>
 <div className="mt-1 space-y-1" onClick={(e) => e.stopPropagation()}>
 {daySessions.slice(0, 3).map((s) => {
 return (
 <button key={s.id} type="button" onClick={() => onOpen(s.id)} title={`${format(new Date(s.startAt), 'HH:mm')} ${s.title}`} className={`block w-full truncate rounded-md border-l-2 px-1.5 py-1 text-left text-[0.6875rem] font-medium ${STATUS_BLOCK[s.status] ?? STATUS_BLOCK.SCHEDULED} hover:opacity-80`}>
 <span className="font-semibold">{format(new Date(s.startAt), 'HH:mm')}</span> {s.title || sessionStatusLabel(s.status)}
 </button>
 );
 })}
 {daySessions.length > 3 ? <span className="block text-[0.6875rem] text-muted">+{daySessions.length - 3} more</span> : null}
 {daySessions.length === 0 && onCreateAtDate && !past ? (
 <span className="hidden text-[0.6875rem] text-brand group-hover:block">+ Add session</span>
 ) : null}
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
}
