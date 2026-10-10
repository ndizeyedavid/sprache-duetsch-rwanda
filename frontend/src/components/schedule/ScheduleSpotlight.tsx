import { format } from 'date-fns';
import { FiArrowUpRight,FiClock } from 'react-icons/fi';
import type { ScheduleSession } from './ScheduleSessionCard';

export function ScheduleSpotlight({ sessions, onOpen, teacher = false }: { sessions: ScheduleSession[]; onOpen: (id: string) => void; teacher?: boolean }) {
  const next = sessions.filter(s => ['LIVE', 'SCHEDULED', 'RESCHEDULED'].includes(s.status) && Date.parse(s.endAt) > Date.now()).sort((a, b) => Number(b.status === 'LIVE') - Number(a.status === 'LIVE') || Date.parse(a.startAt) - Date.parse(b.startAt))[0];
  return <div className="relative mb-6 overflow-hidden rounded-box bg-neutral p-5 text-neutral-content sm:p-6">
    <div className="relative flex items-center gap-4 sm:gap-6">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-[.18em] opacity-65">{next?.status === 'LIVE' ? 'Class is live' : next ? 'Coming up next' : teacher ? 'Bring your class together' : 'A little practice. A little progress.'}</p>
        <h2 className="mt-2 max-w-xl text-xl font-semibold leading-snug sm:text-2xl">{next?.title ?? (teacher ? 'No class scheduled yet.' : 'No class scheduled yet.')}</h2>
        {next ? <><p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-80"><span className="inline-flex items-center gap-1.5"><FiClock />{format(new Date(next.startAt), 'EEE d MMM · HH:mm')}–{format(new Date(next.endAt), 'HH:mm')}</span><span>{next.mode === 'ONSITE' ? next.room ?? 'On campus' : 'Online class'}</span></p><button type="button" onClick={() => onOpen(next.id)} className="btn btn-sm mt-4 rounded-full border-0 bg-neutral-content text-neutral">{teacher ? 'Prepare for class' : 'View class details'}<FiArrowUpRight /></button></> : <p className="mt-3 max-w-lg text-sm leading-6 opacity-75">{teacher ? 'Plan a focused session and give your students something to look forward to.' : 'Your live classes will appear below. Until then, keep building your German with your course lessons.'}</p>}
      </div>
      <div className="hidden shrink-0 items-center justify-center rounded-full bg-neutral-content/10 sm:flex sm:size-36"><img src="/illustrations/course-learner.webp" alt="" className="h-36 w-32 object-contain" /></div>
    </div>
  </div>;
}
