import { FiCalendar,FiGlobe } from 'react-icons/fi';
import { sessionTimeLabels } from '../../../lib/session-time';

/** Class time for the red drawer header (white text); adds the viewer's own time when it differs. */
export function SessionHeaderTimes({ startAt, endAt, timezone }: { startAt: string; endAt: string; timezone: string | null }) {
  const { session, local } = sessionTimeLabels(startAt, endAt, timezone);
  return (
    <span className="block space-y-0.5">
      <span className="flex items-center gap-1.5"><FiCalendar aria-hidden />{session.label}</span>
      {local ? <span className="flex items-center gap-1.5"><FiGlobe aria-hidden />Your time: {local.date} · {local.start}–{local.end}</span> : null}
    </span>
  );
}
