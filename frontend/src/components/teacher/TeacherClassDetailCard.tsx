import { FiArrowRight,FiBookOpen,FiMapPin,FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ClassGroupItem } from '../../lib/services';
import { humanize } from '../../lib/services';

export function TeacherClassDetailCard({ group }: { group: ClassGroupItem }) {
  return (
    <article className={`card h-full overflow-hidden bg-base-100 ${group.isActive ? '' : 'opacity-70'}`}>
      <div className="flex items-center justify-between gap-4 bg-neutral p-5 text-neutral-content">
        <div className="flex items-center gap-3">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-box bg-base-100 text-2xl font-semibold text-base-content">{group.level.code}</span>
          <div><p className="text-xs font-medium">{humanize(group.shift)}</p><p className="mt-1 text-xs text-neutral-content">{group.intake.name}</p></div>
        </div>
        <FiBookOpen className="size-6 shrink-0 text-neutral-content" aria-hidden />
      </div>
      <div className="card-body gap-0 p-5">
        <h2 className="card-title text-lg leading-7">{group.name}</h2>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted"><FiMapPin aria-hidden />{group.campus.name}</p>
        <div className="my-5 flex items-center justify-between gap-3 rounded-box bg-base-200 px-4 py-3">
          <span className="flex items-center gap-2 text-sm"><FiUsers aria-hidden /><strong>{group._count.enrollments}</strong> enrolled</span>
          <span className="text-xs text-muted">{group.code}</span>
        </div>
        <div className="card-actions mt-auto grid grid-cols-2 gap-2">
          <Link to={`/teacher/classes/${group.id}/people`} className="btn btn-sm justify-between" aria-label={`Open students in ${group.name}`}>Students<FiArrowRight aria-hidden /></Link>
          <Link to={`/teacher/grading?classGroupId=${group.id}`} className="btn btn-sm btn-ghost" aria-label={`Open grading for ${group.name}`}>Grading</Link>
        </div>
      </div>
    </article>
  );
}
