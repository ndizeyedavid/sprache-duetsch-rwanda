import { format,formatDistanceToNowStrict } from 'date-fns';
import { FiArrowUpRight,FiClock,FiMapPin,FiUser,FiVideo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { SessionItem } from '../../lib/services';
import { isoTime } from '../../lib/services';
import { sessionStatusLabel,teacherName } from '../../lib/sessions-ui';
import { ClassJoinLink } from '../schedule/ClassJoinLink';
import { CardArtPanel } from './CardArtPanel';

/** Next live class with countdown, teacher and place; a friendly explainer when nothing is scheduled. */
export function DashboardClassCard({ session }: { session: SessionItem | null }) {
  const live = session?.status === 'LIVE';
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-sm font-semibold">Next live class</h2><FiVideo aria-hidden className="text-muted" /></div>
      {session ? <>
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-primary text-primary-content"><span className="text-[0.625rem] uppercase">{format(new Date(session.startAt), 'MMM')}</span><span className="text-2xl font-semibold">{format(new Date(session.startAt), 'd')}</span></div>
          <div className="min-w-0">
            <span className={`text-[0.625rem] font-semibold ${live ? 'text-primary' : 'text-muted'}`}>{live ? '● Live now' : `${sessionStatusLabel(session.status)} · in ${formatDistanceToNowStrict(new Date(session.startAt))}`}</span>
            <h3 className="mt-1 text-sm font-semibold leading-6">{session.title}</h3>
          </div>
        </div>
        <ul className="space-y-1.5 text-xs text-muted">
          <li className="flex items-center gap-2"><FiClock aria-hidden />{format(new Date(session.startAt), 'EEEE')} · {isoTime(session.startAt)} – {isoTime(session.endAt)}</li>
          <li className="flex items-center gap-2"><FiUser aria-hidden />{teacherName(session.teacher)}</li>
          <li className="flex items-center gap-2"><FiMapPin aria-hidden />{session.room ?? (session.mode === 'ONSITE' ? 'On campus' : 'Online class')}{session.classGroup ? ` · ${session.classGroup.name}` : ''}</li>
        </ul>
        {session.meetingUrl ? <ClassJoinLink sessionId={session.id} href={session.meetingUrl} className="btn btn-primary btn-sm w-full gap-2 rounded-full">Join class <FiArrowUpRight aria-hidden /></ClassJoinLink>
          : <p className="rounded-box bg-base-200 px-3 py-2 text-[0.6875rem] text-muted">The meeting link appears here before class starts.</p>}
      </> : (
        <CardArtPanel art="schedule" stacked>
          <p className="text-base font-semibold leading-tight text-primary">Bald geht’s los!</p>
          <p className="text-xs leading-5 text-muted">No live class is scheduled yet. When your teacher adds one, it shows here with the join link — and you get a notification.</p>
        </CardArtPanel>
      )}
      <Link to="/schedule" className="btn btn-ghost btn-sm mt-auto justify-between rounded-full border border-line">Full schedule <FiArrowUpRight aria-hidden /></Link>
    </section>
  );
}
