import { FiArrowRight,FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyProfile } from '../../lib/services';
import { ATTENDANCE_TARGET,TONE_FLAT } from './constants';
import { attendanceBar,attendanceStanding } from './utils';

type Props = { attendance: MyProfile['attendance'] };

/**
 * Attendance is one of two things that decide whether a learner keeps studying,
 * so it gets a verdict and a recovery step — not just a percentage.
 */
export function AttendanceStanding({ attendance }: Props) {
  const standing = attendanceStanding(attendance);
  const slices = attendanceBar(attendance);

  return (
    <section className="card items-start gap-4 border border-line bg-base-100 p-5">
      <div className="flex w-full items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiCheckCircle aria-hidden className="text-brand" />Attendance standing
        </h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE_FLAT[standing.tone]}`}>
          {standing.label}
        </span>
      </div>

      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">
          {attendance.total ? `${attendance.percentage}%` : '—'}
        </p>
        <p className="text-xs text-muted">attended · target {ATTENDANCE_TARGET}%</p>
      </div>

      <div className="flex h-2 w-full overflow-hidden rounded-full bg-base-200" aria-hidden>
        {slices.map((slice) => (
          <span key={slice.key} className={slice.bar} style={{ width: `${slice.share}%` }} />
        ))}
      </div>

      <dl className="grid w-full grid-cols-2 gap-x-4 gap-y-2">
        {slices.map((slice) => (
          <div key={slice.key} className="flex items-center gap-2 text-xs">
            <span aria-hidden className={`size-2 shrink-0 rounded-full ${slice.bar}`} />
            <dt className="text-muted">{slice.label}</dt>
            <dd className="ml-auto font-semibold tabular-nums">{slice.value}</dd>
          </div>
        ))}
      </dl>

      {standing.low ? (
        <p className="text-xs leading-5 text-error">
          Below {ATTENDANCE_TARGET}%. Ask your teacher about a make-up class before the next exam.
        </p>
      ) : null}

      <Link to="/attendance" className="flex w-full items-center justify-between rounded-box bg-base-200 px-4 py-3 text-xs font-semibold">
        Attendance record<FiArrowRight aria-hidden className="text-brand" />
      </Link>
    </section>
  );
}
