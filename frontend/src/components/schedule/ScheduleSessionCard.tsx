import { format } from 'date-fns';
import type { ReactNode } from 'react';
import { FiArrowUpRight,FiClock,FiMapPin,FiVideo } from 'react-icons/fi';
import { sessionStatusLabel,teacherName } from '../../lib/sessions-ui';
import { ClassJoinLink } from './ClassJoinLink';

export type ScheduleSession = {
  id: string; title: string; startAt: string; endAt: string; status: string; mode: string;
  meetingUrl: string | null; recordingUrl?: string | null; room?: string | null;
  teacher: { firstName: string; lastName: string } | null; classGroup: { name: string } | null;
};
export function ScheduleSessionCard({ session, onOpen, actions }: { session: ScheduleSession; onOpen: () => void; actions?: ReactNode }) {
  const ended = session.status === 'COMPLETED' || new Date(session.endAt).getTime() < Date.now();
  const muted = ended || session.status === 'CANCELLED';
  const active = !ended && ['LIVE', 'SCHEDULED', 'RESCHEDULED'].includes(session.status);
  const link = ended && session.status !== 'CANCELLED' ? session.recordingUrl : active ? session.meetingUrl : null;
  const online = session.mode !== 'ONSITE';
  const Icon = online ? FiVideo : FiMapPin;
  const tone = session.status === 'LIVE' ? 'badge-success' : session.status === 'CANCELLED' ? 'badge-error' : ended ? 'badge-ghost' : 'badge-info';
  return <article className={`card border p-4 transition sm:p-5 ${muted ? 'border-base-300 bg-base-200 text-muted' : 'border-secondary bg-base-100 hover:border-secondary hover:bg-base-200'}`}>
    <div className="flex flex-wrap items-start gap-3 sm:gap-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${muted ? 'bg-base-300 text-muted' : online ? 'bg-secondary text-secondary-content' : 'bg-neutral text-neutral-content'}`}><Icon size={20} aria-hidden /></span>
      <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left focus-visible:outline-2 focus-visible:outline-secondary">
        <p className="text-xs text-muted">{session.classGroup?.name ?? 'Live class'}</p>
        <h3 className="mt-1 text-sm font-semibold leading-6 sm:text-base">{session.title || 'Untitled session'}</h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted"><span className="inline-flex items-center gap-1.5"><FiClock aria-hidden />{format(new Date(session.startAt), 'HH:mm')}–{format(new Date(session.endAt), 'HH:mm')}</span><span>{teacherName(session.teacher)}</span><span>{session.room ?? (online ? session.mode === 'HYBRID' ? 'Hybrid class' : 'Online class' : 'On campus')}</span></div>
      </button>
      <span className={`badge badge-soft badge-sm ${tone}`}>{ended && session.status === 'SCHEDULED' ? 'Ended' : sessionStatusLabel(session.status)}</span>
      <div className="flex w-full items-center justify-end gap-2 sm:w-auto sm:self-center">
        {link ? <ClassJoinLink sessionId={ended ? undefined : session.id} href={link} className={`btn btn-sm rounded-full ${muted ? 'btn-ghost' : session.status === 'LIVE' ? 'btn-success' : 'btn-neutral'}`}>{ended ? 'Recording' : session.status === 'LIVE' ? 'Join now' : 'Join class'}<FiArrowUpRight aria-hidden /></ClassJoinLink> : <button type="button" onClick={onOpen} className="btn btn-ghost btn-sm rounded-full">Details<FiArrowUpRight aria-hidden /></button>}
        {actions}
      </div>
    </div>
  </article>;
}
