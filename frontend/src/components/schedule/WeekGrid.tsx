import { FiPlus } from 'react-icons/fi';
import { format, isSameDay, isToday, parseISO } from 'date-fns';
import { weekDays } from './utils';
import { sessionTone } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';

type Session = { id: string; title: string; startAt: string; endAt: string; status: string; classGroup: { name: string } | null };

type Props = { anchor: Date; sessions: Session[]; onOpen: (id: string) => void; onPickDay: (d: Date) => void; onCreateAtDate?: (d: Date) => void };

const HOURS = Array.from({ length: 13 }, (_, i) => 7 + i);

export function WeekGrid({ anchor, sessions, onOpen, onPickDay, onCreateAtDate }: Props) {
 const days = weekDays(anchor);
 return (
 <div className="overflow-x-auto">
 <div className="min-w-[640px]">
 <div className="grid grid-cols-[3.5rem_repeat(7,1fr)] gap-px bg-line">
 <div className="bg-base-200 p-2" />
 {days.map((d) => (
 <div key={d.toISOString()} className={`group relative bg-base-100 p-2 text-center ${isToday(d) ? 'bg-brand-soft' : ''}`}>
 <button type="button" onClick={() => onPickDay(d)} className="w-full">
 <span className="block text-[11px] font-medium text-muted">{format(d, 'EEE')}</span>
 <span className={`mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm font-bold ${isToday(d) ? 'bg-brand text-white' : isSameDay(d, anchor) ? 'bg-base-300' : ''}`}>{format(d, 'd')}</span>
 </button>
 {onCreateAtDate ? (
 <button type="button" aria-label={`Create session on ${format(d, 'd MMMM yyyy')}`} onClick={() => onCreateAtDate(d)} className="btn btn-ghost btn-xs btn-circle absolute right-1 top-1 size-5 opacity-0 group-hover:opacity-100 hover:bg-brand hover:text-white">
 <FiPlus aria-hidden className="text-xs" />
 </button>
 ) : null}
 </div>
 ))}
 {HOURS.map((h) => (
 <div key={h} className="contents">
 <div className="bg-base-100 p-2 text-right text-[11px] text-muted">{h}:00</div>
 {days.map((d) => {
 const slot = sessions.filter((s) => {
 const sd = parseISO(s.startAt);
 return isSameDay(sd, d) && sd.getHours() === h;
 });
 return (
 <button key={`${d.toISOString()}-${h}`} type="button" onClick={() => onCreateAtDate?.(d)} className="min-h-12 bg-base-100 p-1 text-left hover:bg-base-200/50">
 {slot.length === 0 ? <span className="hidden text-[11px] text-brand group-hover:block">+</span> : null}
 {slot.map((s) => {
 const tc = TONE_CLASSES[sessionTone(s.status)];
 return (
 <span key={s.id} role="button" tabIndex={0} onClick={(e) => { e.stopPropagation(); onOpen(s.id); }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); onOpen(s.id); } }} className={`block w-full truncate rounded-md px-2 py-1 text-left text-[11px] font-medium ${tc.soft} ${tc.text} hover:opacity-80`}>
 {s.title}
 </span>
 );
 })}
 </button>
 );
 })}
 </div>
 ))}
 </div>
 </div>
 </div>
 );
}
