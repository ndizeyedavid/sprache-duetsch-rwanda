import { Link } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { MiniCalendar } from '../../components/ui/Calendar';
import { ScheduleCard } from '../../components/cards/ScheduleCard';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { photos } from '../../lib/images';
import { getMySessions, getUpcomingSessions, isoDate, isoTime } from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';

const AVATARS = [photos.clarisse, photos.nadine, photos.jeanPaul, photos.aline, photos.eric];

export function Schedule() {
 const upcoming = useApi('upcoming-sessions', getUpcomingSessions);
 const history = useApi('my-sessions', getMySessions);

 const sessions = upcoming.data ?? [];
 const past = history.data ?? [];

 return (
 <div className="grid gap-5 xl:grid-cols-12">
 <div className="space-y-5 xl:col-span-8">
 <Panel>
 <h2 className="mb-4 text-base font-semibold sm:text-lg">Upcoming classes</h2>
 {upcoming.loading ? (
 <LoadingBlock label="Loading upcoming classes…" />
 ) : upcoming.error ? (
 <ErrorBlock message={upcoming.error} onRetry={upcoming.refetch} />
 ) : sessions.length === 0 ? (
 <EmptyBlock title="No upcoming classes" hint="Check back later or ask your teacher." />
 ) : (
 <div className="grid gap-4 sm:grid-cols-2">
 {sessions.map((session, index) => (
 <div key={session.id} className="space-y-2">
 <ScheduleCard
 title={session.title}
 teacher={teacherName(session.teacher)}
 photo={AVATARS[index % AVATARS.length]}
 date={isoDate(session.startAt)}
 time={`${isoTime(session.startAt)} – ${isoTime(session.endAt)}`}
 tone={sessionTone(session.status)}
 status={sessionStatusLabel(session.status)}
 />
 {session.meetingUrl ? (
 <a
 href={session.meetingUrl}
 target="_blank"
 rel="noreferrer"
 className="btn btn-sm w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90"
 >
 Join live class
 </a>
 ) : null}
 </div>
 ))}
 </div>
 )}
 </Panel>

 <Panel>
 <h2 className="mb-4 text-base font-semibold sm:text-lg">Past classes</h2>
 {history.loading ? (
 <LoadingBlock label="Loading past classes…" />
 ) : history.error ? (
 <ErrorBlock message={history.error} onRetry={history.refetch} />
 ) : past.length === 0 ? (
 <EmptyBlock title="No past classes yet" />
 ) : (
 <div className="space-y-3">
 {past.slice(0, 8).map((session, index) => (
 <ScheduleCard
 key={session.id}
 title={session.title}
 teacher={teacherName(session.teacher)}
 photo={AVATARS[index % AVATARS.length]}
 date={isoDate(session.startAt)}
 time={`${isoTime(session.startAt)} – ${isoTime(session.endAt)}`}
 tone={sessionTone(session.status)}
 status={sessionStatusLabel(session.status)}
 />
 ))}
 </div>
 )}
 </Panel>
 </div>

 <div className="space-y-5 xl:col-span-4">
 <Panel>
 <MiniCalendar marked={sessions.map((session) => new Date(session.startAt).getDate())} />
 </Panel>
 <Panel>
 <h2 className="text-base font-semibold">Need help?</h2>
 <p className="mt-1 text-xs leading-relaxed text-muted">
 Class links appear here once your teacher schedules a live session.
 </p>
 <Link
 to="/instructors"
 className="btn btn-sm mt-4 w-full rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white"
 >
 View teachers
 </Link>
 </Panel>
 </div>
 </div>
 );
}
