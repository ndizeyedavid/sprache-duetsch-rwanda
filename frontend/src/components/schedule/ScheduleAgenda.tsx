import { FiCalendar,FiCheckCircle } from 'react-icons/fi';
import { AgendaDayHeading } from './AgendaDayHeading';
import type { ScheduleSession } from './ScheduleSessionCard';
import { SessionRow } from './SessionRow';
import { StudentSessionRow } from './StudentSessionRow';
import { groupByDay } from './utils';

type Props = { sessions: ScheduleSession[]; onOpen: (id: string) => void; onEdit?: (id: string) => void; onCancel?: (id: string) => void };
export function ScheduleAgenda({ sessions, onOpen, onEdit, onCancel }: Props) {
  const past = (s: ScheduleSession) => ['COMPLETED', 'CANCELLED'].includes(s.status) || Date.parse(s.endAt) < Date.now();
  const sections = [
    { title: 'Upcoming classes', hint: 'Your next opportunities to learn together.', icon: FiCalendar, muted: false, groups: groupByDay(sessions.filter(s => !past(s))) },
    { title: 'Past classes', hint: 'Revisit the details and available recordings.', icon: FiCheckCircle, muted: true, groups: groupByDay(sessions.filter(past)).reverse() },
  ].filter(s => s.groups.length);
  if (!sessions.length) return <div className="rounded-box bg-base-200 px-6 py-10 text-center"><img src="/illustrations/study-books.webp" alt="" className="mx-auto mb-4 size-24 object-contain" /><h3 className="font-semibold">Your classes will appear here</h3><p className="mt-2 text-sm text-muted">All upcoming and past sessions in one place.</p></div>;
  return <div className="space-y-8">{sections.map(section => <section key={section.title} className={`overflow-hidden rounded-box border ${section.muted ? 'border-base-300 bg-base-200' : 'border-secondary bg-secondary text-secondary-content'}`} aria-label={section.title}>
    <div className={`flex items-center gap-3 p-4 sm:p-5 ${section.muted ? 'bg-neutral text-neutral-content' : 'bg-secondary text-secondary-content'}`}>
      <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-base-100"><section.icon size={21} /></span>
      <div className="min-w-0"><h2 className="text-base font-bold sm:text-lg">{section.title}</h2><p className="mt-1 text-xs opacity-75">{section.hint}</p></div>
      <span className="ml-auto grid size-8 shrink-0 place-items-center rounded-full bg-base-100 text-sm font-semibold">{section.groups.reduce((n,g) => n+g.items.length,0)}</span>
    </div>
    <div className="divide-y divide-base-300 px-3 sm:px-5">{section.groups.map(g => <div key={g.date} className="py-5"><AgendaDayHeading date={g.date} label={g.label} count={g.items.length} /><div className="space-y-3">{g.items.map(s => onEdit && onCancel ? <SessionRow key={s.id} session={s} onOpen={() => onOpen(s.id)} onEdit={() => onEdit(s.id)} onCancel={() => onCancel(s.id)} /> : <StudentSessionRow key={s.id} session={s} onOpen={() => onOpen(s.id)} />)}</div></div>)}</div>
  </section>)}</div>;
}
