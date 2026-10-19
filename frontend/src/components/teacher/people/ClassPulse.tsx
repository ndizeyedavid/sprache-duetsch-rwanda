import { FiAlertTriangle,FiAward,FiCheckSquare,FiUsers } from 'react-icons/fi';
import type { RosterStudent } from './roster-data';
import { average } from './roster-data';

type Props = { roster: RosterStudent[]; capacity: number; threshold: number | null; loading: boolean };

const tile = 'rounded-box border border-line bg-base-100 p-4';

/** The class in four numbers: size, attendance, results and who needs support. */
export function ClassPulse({ roster, capacity, threshold, loading }: Props) {
  const attendance = average(roster.map((row) => row.attendance?.percentage));
  const score = average(roster.map((row) => row.score));
  const support = roster.filter((row) => row.risk).length;
  const dash = loading ? '…' : '—';
  const fill = capacity ? Math.min(100, Math.round((roster.length / capacity) * 100)) : 0;
  return (
    <section aria-label="Class pulse" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <div className={tile}>
        <p className="flex items-center gap-1.5 text-xs text-muted"><FiUsers aria-hidden />Learners</p>
        <p className="mt-1 text-2xl font-semibold">{roster.length}<span className="text-sm font-normal text-muted"> / {capacity || '—'}</span></p>
        <progress className="progress progress-primary mt-2 h-1.5 w-full" value={fill} max={100} aria-label={`${fill}% of seats filled`} />
      </div>
      <div className={tile}>
        <p className="flex items-center gap-1.5 text-xs text-muted"><FiCheckSquare aria-hidden />Attendance</p>
        <p className={`mt-1 text-2xl font-semibold ${attendance !== null && threshold !== null && attendance < threshold ? 'text-error' : ''}`}>{attendance === null ? dash : `${attendance}%`}</p>
        <p className="mt-1 text-[0.6875rem] text-muted">{threshold !== null ? `Alert below ${threshold}%` : 'Class average'}</p>
      </div>
      <div className={tile}>
        <p className="flex items-center gap-1.5 text-xs text-muted"><FiAward aria-hidden />Average score</p>
        <p className="mt-1 text-2xl font-semibold">{score === null ? dash : `${score}%`}</p>
        <p className="mt-1 text-[0.6875rem] text-muted">Graded quizzes and tests</p>
      </div>
      <div className={`rounded-box p-4 ${support ? 'hero-band' : 'border border-line bg-base-100'}`}>
        <p className={`flex items-center gap-1.5 text-xs ${support ? '' : 'text-muted'}`}><FiAlertTriangle aria-hidden />Needs support</p>
        <p className="mt-1 text-2xl font-semibold">{loading && !support ? dash : support}</p>
        <p className="mt-1 text-[0.6875rem]">{support ? 'Flagged for attendance, scores or homework' : 'Nobody flagged right now'}</p>
      </div>
    </section>
  );
}
