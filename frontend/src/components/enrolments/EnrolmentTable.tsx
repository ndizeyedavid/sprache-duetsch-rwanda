import { useFinanceAccess } from '../../hooks/useFinanceAccess';
import { FiUserPlus } from 'react-icons/fi';
import { rwf } from '../../lib/format';
import type { EnrollmentRow } from '../../lib/services';
import { humanize,isoDate,money } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';

type Props = {
  rows: EnrollmentRow[];
  savingId: string | null;
  onManage: (row: EnrollmentRow) => void;
};

/** Desktop register — the roster an academic admin scans and works down. */
export function EnrolmentTable({ rows, savingId, onManage }: Props) {
  const canFinance = useFinanceAccess();
  return (
    <div className="overflow-x-auto">
      <table className="table w-full text-xs">
        <caption className="sr-only">Enrolments with level, intake and class</caption>
        <thead>
          <tr className="text-muted">
            <th scope="col" className="text-left">Student</th>
            <th scope="col" className="text-left">Level</th>
            <th scope="col" className="text-left">Intake</th>
            <th scope="col" className="text-left">Class</th>
            {canFinance && <th scope="col" className="text-right">Tuition</th>}
            <th scope="col" className="text-left">Status</th>
            <th scope="col" className="text-right">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-t border-line align-middle">
              <td className="py-3 pr-4">
                <p className="font-semibold text-ink">
                  {row.student.user.firstName} {row.student.user.lastName}
                </p>
                <p className="text-muted">{row.student.studentCode}</p>
              </td>
              <td className="py-3 pr-4">
                <span className="font-medium text-ink">{row.level.code}</span>
                <span className="block text-muted">{row.level.title}</span>
              </td>
              <td className="py-3 pr-4">{row.intake.name}</td>
              <td className="py-3 pr-4">
                {row.classGroup ? (
                  <span>
                    <span className="font-medium text-ink">{row.classGroup.name}</span>
                    <span className="block text-muted">{row.classGroup.shift}</span>
                  </span>
                ) : (
                  <span className="font-medium text-[#B4400F]">Not assigned</span>
                )}
              </td>
              {canFinance && <><td className="py-3 pr-4 text-right tabular-nums">
                <span className="font-semibold text-ink">{rwf(money(row.totalFee))}</span>
                <span className="block text-muted">enrolled {isoDate(row.enrolledAt)}</span>
              </td></>}
              <td className="py-3 pr-4">
                <StatusBadge status={humanize(row.status)} />
              </td>
              <td className="py-3 text-right">
                <button
                  type="button"
                  onClick={() => onManage(row)}
                  disabled={savingId === row.id}
                  className="btn btn-sm rounded-full border-line bg-base-100 text-xs font-medium text-ink hover:bg-base-200 disabled:opacity-60"
                >
                  {savingId === row.id ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <FiUserPlus aria-hidden />
                  )}
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