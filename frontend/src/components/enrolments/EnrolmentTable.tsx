import { FiUserPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { EnrollmentRow } from '../../lib/services';
import { humanize } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';
import { AccessBadge } from './AccessBadge';
import { LearningCell } from './LearningCell';

type Props = {
  rows: EnrollmentRow[];
  savingId: string | null;
  onManage: (row: EnrollmentRow) => void;
  selected: Set<string>;
  onSelect: (ids: string[], checked: boolean) => void;
};

/** Desktop register — the roster an academic admin scans and works down; tick rows for bulk actions. */
export function EnrolmentTable({ rows, savingId, onManage, selected, onSelect }: Props) {
  const allChecked = rows.length > 0 && rows.every((row) => selected.has(row.id));
  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-xs">
        <caption className="sr-only">Enrolments with class, course access and learning progress</caption>
        <thead>
          <tr className="text-muted">
            <th scope="col" className="w-8">
              <input type="checkbox" className="checkbox checkbox-xs" aria-label="Select all shown enrolments" checked={allChecked}
                onChange={(event) => onSelect(rows.map((row) => row.id), event.currentTarget.checked)} />
            </th>
            <th scope="col" className="text-left">Student</th>
            <th scope="col" className="text-left">Course</th>
            <th scope="col" className="text-left">Class</th>
            <th scope="col" className="text-left">Course access</th>
            <th scope="col" className="text-left">Learning</th>
            <th scope="col" className="text-left">Status</th>
            <th scope="col" className="text-right"><span className="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={`border-t border-line align-middle ${selected.has(row.id) ? 'bg-base-200/70' : ''}`}>
              <td>
                <input type="checkbox" className="checkbox checkbox-xs" checked={selected.has(row.id)}
                  aria-label={`Select ${row.student.user.firstName} ${row.student.user.lastName}`}
                  onChange={(event) => onSelect([row.id], event.currentTarget.checked)} />
              </td>
              <td className="py-3 pr-4">
                <Link to={`/admin/students/${row.student.id}`} className="font-semibold text-ink hover:underline">
                  {row.student.user.firstName} {row.student.user.lastName}
                </Link>
                <p className="text-muted">{row.student.studentCode}</p>
                {row.student.user.phone ? <a href={`tel:${row.student.user.phone}`} className="text-muted hover:underline">{row.student.user.phone}</a> : null}
              </td>
              <td className="py-3 pr-4">
                <span className="font-medium text-ink">{row.level.code}</span>
                <span className="block text-muted">{row.intake.name}</span>
                {row.campus ? <span className="block text-muted">{row.campus.name}</span> : null}
              </td>
              <td className="py-3 pr-4">
                {row.classGroup ? (
                  <span>
                    <span className="font-medium text-ink">{row.classGroup.name} ({row.classGroup.code})</span>
                    <span className="block text-muted">{humanize(row.classGroup.shift)}</span>
                  </span>
                ) : <span className="font-medium text-[#B4400F]">Not assigned</span>}
              </td>
              <td className="py-3 pr-4"><AccessBadge row={row} /></td>
              <td className="py-3 pr-4"><LearningCell row={row} /></td>
              <td className="py-3 pr-4"><StatusBadge status={humanize(row.status)} /></td>
              <td className="py-3 text-right">
                <button type="button" onClick={() => onManage(row)} disabled={savingId === row.id}
                  className="btn btn-sm rounded-full border-line bg-base-100 text-xs font-medium text-ink hover:bg-base-200 disabled:opacity-60">
                  {savingId === row.id ? <span className="loading loading-spinner loading-xs" /> : <FiUserPlus aria-hidden />}
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
