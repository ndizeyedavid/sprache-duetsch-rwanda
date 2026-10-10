import { FiCheckCircle } from 'react-icons/fi';
import type { StudentDetail } from '../../lib/services/student-detail';
import { ATTENDANCE_TARGET,TONE_FLAT } from '../profile/constants';
import { attendanceBar,attendanceStanding } from '../profile/utils';

/** Same verdict and colour bar the student sees, worded for staff. */
export function AttendanceSummaryCard({ summary }: { summary: StudentDetail['attendance'] }) {
  const standing = attendanceStanding(summary);
  const slices = attendanceBar(summary);

  return (
    <section className="card gap-4 border border-line bg-base-100 p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiCheckCircle aria-hidden className="text-brand" />Attendance standing
        </h2>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TONE_FLAT[standing.tone]}`}>{standing.label}</span>
      </div>
      <p className="text-3xl font-semibold tabular-nums">
        {summary.total ? `${Math.round(summary.percentage)}%` : '—'}
        <span className="ml-2 text-xs font-normal text-muted">of {summary.total} session{summary.total === 1 ? '' : 's'} · target {ATTENDANCE_TARGET}%</span>
      </p>
      <div className="flex h-2 overflow-hidden rounded-full bg-base-200" aria-hidden>
        {slices.map((slice) => <span key={slice.key} className={slice.bar} style={{ width: `${slice.share}%` }} />)}
      </div>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
        {slices.map((slice) => (
          <div key={slice.key} className="flex items-center gap-2 text-xs">
            <span aria-hidden className={`size-2 rounded-full ${slice.bar}`} />
            <dt className="text-muted">{slice.label}</dt>
            <dd className="ml-auto font-semibold tabular-nums">{slice.value}</dd>
          </div>
        ))}
      </dl>
      {standing.low ? (
        <p className="text-xs leading-5 text-error">Below the {ATTENDANCE_TARGET}% target — consider a follow-up with the student and their teacher.</p>
      ) : null}
    </section>
  );
}
