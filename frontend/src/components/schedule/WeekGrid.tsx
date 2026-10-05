import { FiPlus } from 'react-icons/fi';
import { format, isSameDay, isToday } from 'date-fns';
import { weekDays } from './utils';
import { sessionStatusLabel } from '../../lib/sessions-ui';
type Session = { id: string; title: string; startAt: string; endAt: string; status: string; classGroup: { name: string } | null };
type Props = { anchor: Date; sessions: Session[]; onOpen: (id: string) => void; onPickDay: (d: Date) => void; onCreateAtDate?: (d: Date) => void };
export function WeekGrid({ anchor, sessions, onOpen, onPickDay, onCreateAtDate }: Props) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">{weekDays(anchor).map(day => {
    const items = sessions.filter(s => isSameDay(new Date(s.startAt), day)).sort((a,b) => Date.parse(a.startAt)-Date.parse(b.startAt));
    return <section key={day.toISOString()} className={`min-w-0 rounded-box p-3 ${isToday(day) ? 'bg-secondary/10' : 'bg-base-200/45'}`}>
      <div className="mb-4 flex items-center justify-between"><button type="button" onClick={() => onPickDay(day)} className="text-left"><span className="block text-xs text-base-content/60">{format(day,'EEE')}</span><span className={`mt-1 grid size-8 place-items-center rounded-full font-semibold ${isToday(day) ? 'bg-secondary text-secondary-content' : ''}`}>{format(day,'d')}</span></button>{onCreateAtDate ? <button className="btn btn-ghost btn-xs btn-circle" aria-label={`Create session on ${format(day,'d MMMM')}`} onClick={() => onCreateAtDate(day)}><FiPlus /></button> : null}</div>
      <div className="space-y-2">{items.length ? items.map(s => <button key={s.id} type="button" onClick={() => onOpen(s.id)} className="card w-full bg-base-100 p-3 text-left hover:bg-base-300/40"><span className="text-[10px] font-semibold text-secondary">{format(new Date(s.startAt),'HH:mm')}–{format(new Date(s.endAt),'HH:mm')}</span><span className="mt-2 text-xs font-semibold leading-5">{s.title}</span><span className="mt-2 text-[10px] text-base-content/60">{sessionStatusLabel(s.status)}</span></button>) : <p className="py-3 text-xs text-base-content/45">No classes</p>}</div>
    </section>;
  })}</div>;
}
