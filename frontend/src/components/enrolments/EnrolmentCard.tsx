import { FiCalendar,FiLayers,FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { EnrollmentRow } from '../../lib/services';
import { humanize } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';
import { AccessBadge } from './AccessBadge';
import { LearningCell } from './LearningCell';

type Props = {
  row: EnrollmentRow;
  onManage: (row: EnrollmentRow) => void;
  selected: boolean;
  onSelect: (ids: string[], checked: boolean) => void;
};

/** Phone-first replacement for the table row: one enrolment per card, same facts. */
export function EnrolmentCard({ row, onManage, selected, onSelect }: Props) {
  const name = `${row.student.user.firstName} ${row.student.user.lastName}`;
  return (
    <li className={`rounded-field border p-4 ${selected ? 'border-primary bg-base-200/70' : 'border-line bg-base-100'}`}>
      <div className="flex items-start justify-between gap-3">
        <label className="flex min-w-0 items-start gap-2">
          <input type="checkbox" className="checkbox checkbox-xs mt-1" checked={selected} aria-label={`Select ${name}`}
            onChange={(event) => onSelect([row.id], event.currentTarget.checked)} />
          <span className="min-w-0">
            <Link to={`/admin/students/${row.student.id}`} className="block truncate text-sm font-semibold text-ink hover:underline">{name}</Link>
            <span className="block truncate text-[0.6875rem] text-muted">{row.student.studentCode}{row.student.user.phone ? ` · ${row.student.user.phone}` : ''}</span>
          </span>
        </label>
        <StatusBadge status={humanize(row.status)} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[0.6875rem]">
        <div>
          <dt className="flex items-center gap-1 text-muted"><FiLayers aria-hidden />Level</dt>
          <dd className="mt-0.5 font-medium text-ink">{row.level.code}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted"><FiCalendar aria-hidden />Intake</dt>
          <dd className="mt-0.5 font-medium text-ink">{row.intake.name}{row.campus ? ` · ${row.campus.name}` : ''}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted"><FiUser aria-hidden />Class</dt>
          <dd className="mt-0.5 font-medium text-ink">
            {row.classGroup ? `${row.classGroup.name} (${row.classGroup.code})` : <span className="text-[#B4400F]">Not assigned</span>}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Course access</dt>
          <dd className="mt-0.5"><AccessBadge row={row} /></dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted">Learning</dt>
          <dd className="mt-0.5"><LearningCell row={row} /></dd>
        </div>
      </dl>

      <button type="button" onClick={() => onManage(row)} className="btn btn-sm mt-4 w-full rounded-full border-line bg-base-200 text-xs font-medium text-ink">
        Manage enrolment
      </button>
    </li>
  );
}
