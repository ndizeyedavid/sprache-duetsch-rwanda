import { Link } from 'react-router-dom';
import { FiCalendar, FiClock } from 'react-icons/fi';
import { isoDate, isoTime } from '../../lib/services';
import { sessionStatusLabel, sessionTone } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';

type Session = { id: string; title: string; startAt: string; endAt: string; status: string; meetingUrl: string | null } | null;

type Props = { session: Session; sessions: { id: string; title: string; startAt: string; endAt: string; status: string; meetingUrl: string | null }[] };

export function UpNextCard({ session, sessions }: Props) {
  if (!session) {
    return (
      <div className="p-5 text-center">
        <p className="inline-flex items-center gap-2 text-sm font-bold"><FiCalendar aria-hidden className="text-brand" />Up next</p>
        <p className="mt-1 text-xs text-muted">No class scheduled</p>
        <p className="mt-1 text-xs text-muted">Check the full schedule or ask your teacher.</p>
        <a href="/schedule" className="btn btn-xs mt-3 rounded-full border-line bg-base-100">View schedule</a>
      </div>
    );
  }
  const tc = TONE_CLASSES[sessionTone(session.status)];
  const more = sessions.length > 1 ? sessions.slice(1, 3) : [];
  return (
    <div className="p-5">
      <div className="flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold"><FiCalendar aria-hidden className="text-brand" />Up next</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tc.soft} ${tc.text}`}>{sessionStatusLabel(session.status)}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug">{session.title}</p>
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted"><FiClock aria-hidden />{isoDate(session.startAt)} · {isoTime(session.startAt)} – {isoTime(session.endAt)}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {session.meetingUrl ? <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90">Join live</a> : <span className="rounded-full bg-base-200 px-3 py-1 text-xs text-muted">No link yet</span>}
        <Link to="/schedule" className="btn btn-sm rounded-full border-line bg-base-100">View schedule</Link>
      </div>
      {more.length ? (
        <div className="mt-4 border-t border-line pt-3">
          <p className="text-[11px] font-semibold text-muted">Also coming</p>
          <ul className="mt-2 space-y-1">
            {more.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="truncate font-medium">{s.title}</span>
                <span className="shrink-0 text-[11px] text-muted">{isoDate(s.startAt)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
