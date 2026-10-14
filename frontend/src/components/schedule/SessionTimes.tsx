import { FiCalendar,FiGlobe } from 'react-icons/fi';
import { sessionTimeLabels } from '../../lib/session-time';

type Props = { startAt: string; endAt: string; timezone: string | null };

/** Class time in the session's timezone; the viewer's own time is added only when it differs. */
export function SessionTimes({ startAt, endAt, timezone }: Props) {
  const { session, local } = sessionTimeLabels(startAt, endAt, timezone);
  return (
    <div className="mt-1 space-y-0.5 text-xs text-muted">
      <p className="flex flex-wrap items-center gap-2"><FiCalendar aria-hidden />{session.label}</p>
      {local ? (
        <p className="flex flex-wrap items-center gap-2">
          <FiGlobe aria-hidden />Your time: {local.date} · {local.start}–{local.end} ({local.zone.replaceAll('_', ' ')})
        </p>
      ) : null}
    </div>
  );
}

/** Compact "18:00–20:00" in the session zone, with "(17:00–19:00 your time)" when it differs. */
export function SessionTimeShort({ startAt, endAt, timezone }: Props) {
  const { session, local } = sessionTimeLabels(startAt, endAt, timezone);
  return (
    <span>
      {session.start}–{session.end}
      {local ? <span className="opacity-75"> ({local.start}–{local.end} your time)</span> : null}
    </span>
  );
}
