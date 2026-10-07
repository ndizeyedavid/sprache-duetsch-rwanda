import { format } from 'date-fns';
import { FiArrowUpRight,FiClock,FiVideo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { SessionItem } from '../../lib/services';
import { isoTime } from '../../lib/services';
import { sessionStatusLabel } from '../../lib/sessions-ui';

export function DashboardClassCard({ session }: { session: SessionItem | null }) {
  return (
    <section className="card learning-panel h-full gap-4 p-5 sm:p-6">
      <div className="flex items-center justify-between"><h2 className="text-base font-semibold">Next live class</h2><FiVideo aria-hidden className="text-base-content/50" /></div>
      {session ? <>
        <div className="flex items-center gap-4"><div className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-secondary/15"><span className="text-[10px] uppercase">{format(new Date(session.startAt), 'MMM')}</span><span className="text-2xl font-semibold">{format(new Date(session.startAt), 'd')}</span></div><div className="min-w-0"><span className="text-[10px] text-base-content/60">{sessionStatusLabel(session.status)}</span><h3 className="mt-1 text-sm font-semibold leading-6">{session.title}</h3></div></div>
        <p className="flex items-center gap-2 text-xs text-base-content/65"><FiClock aria-hidden />{isoTime(session.startAt)} – {isoTime(session.endAt)}</p>
        {session.meetingUrl ? <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-neutral btn-sm w-full gap-2 rounded-full">Join class <FiArrowUpRight aria-hidden /></a> : <p className="text-[10px] text-base-content/60">The meeting link will appear here.</p>}
      </> : <div className="flex items-center gap-3 rounded-field bg-base-200/60 p-4"><FiVideo aria-hidden className="text-2xl text-base-content/40" /><p className="text-xs text-base-content/60">No class scheduled yet.</p></div>}
      <Link to="/schedule" className="btn btn-ghost btn-sm mt-auto justify-between rounded-full">Full schedule <FiArrowUpRight aria-hidden /></Link>
    </section>
  );
}
