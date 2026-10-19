import { FiAlertCircle,FiArrowRight,FiAward,FiCalendar,FiCheckSquare,FiMapPin } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ClassGroupItem } from '../../../lib/services';
import { ClassCardBand } from './ClassCardBand';
import { ClassCardStats } from './ClassCardStats';
import type { ClassInsights } from './class-insights';

type Props = { group: ClassGroupItem; insights: ClassInsights | null };

const quickLink = 'btn btn-ghost btn-xs gap-1 rounded-full border border-line';

/** A teacher's class at a glance: who, how many, what's waiting, when it meets — and one tap into it. */
export function TeacherClassCard({ group, insights }: Props) {
  return (
    <article className={`card h-full overflow-hidden border border-line bg-base-100 ${group.isActive ? '' : 'opacity-80'}`}>
      <ClassCardBand group={group} />
      <div className="flex grow flex-col gap-4 p-5">
        <div>
          <h3 className="text-base font-semibold leading-snug">{group.name}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
            <span className="inline-flex items-center gap-1"><FiMapPin aria-hidden />{group.campus.name}</span>
            <span className="font-mono">{group.code}</span>
          </p>
        </div>
        <ClassCardStats enrolled={group._count.enrollments} insights={insights} />
        {insights?.unmarked ? (
          <Link to="/teacher/attendance" className="flex items-center gap-2 rounded-box border border-warning bg-base-100 px-3 py-2 text-xs font-semibold hover:bg-base-200">
            <FiAlertCircle aria-hidden className="shrink-0 text-warning" />{insights.unmarked} attendance {insights.unmarked === 1 ? 'mark' : 'marks'} still open
          </Link>
        ) : null}
        <div className="mt-auto space-y-2">
          <Link to={`/teacher/classes/${group.id}/people`} className="btn btn-primary btn-sm w-full justify-between rounded-full" aria-label={`Open ${group.name}`}>
            Open class <FiArrowRight aria-hidden />
          </Link>
          <div className="flex flex-wrap gap-1.5">
            <Link to="/teacher/attendance" className={quickLink}><FiCheckSquare aria-hidden />Attendance</Link>
            <Link to={`/teacher/grading?classGroupId=${group.id}`} className={quickLink}><FiAward aria-hidden />Grading</Link>
            <Link to="/teacher/schedule" className={quickLink}><FiCalendar aria-hidden />Schedule</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
