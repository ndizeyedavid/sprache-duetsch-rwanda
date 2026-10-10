import { useFinanceAccess } from '../../hooks/useFinanceAccess';
import { FiCalendar,FiLayers,FiUser } from 'react-icons/fi';
import { rwf } from '../../lib/format';
import type { EnrollmentRow } from '../../lib/services';
import { humanize,money } from '../../lib/services';
import { StatusBadge } from '../ui/StatusBadge';

type Props = {
  row: EnrollmentRow;
  onManage: (row: EnrollmentRow) => void;
};

/** Phone-first replacement for the table row: one enrolment per card, same facts. */
export function EnrolmentCard({ row, onManage }: Props) {
  const canFinance = useFinanceAccess();
  return (
    <li className="rounded-field border border-line bg-base-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">
            {row.student.user.firstName} {row.student.user.lastName}
          </p>
          <p className="truncate text-[11px] text-muted">{row.student.studentCode}</p>
        </div>
        <StatusBadge status={humanize(row.status)} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div>
          <dt className="flex items-center gap-1 text-muted">
            <FiLayers aria-hidden />Level
          </dt>
          <dd className="mt-0.5 font-medium text-ink">{row.level.code}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted">
            <FiCalendar aria-hidden />Intake
          </dt>
          <dd className="mt-0.5 font-medium text-ink">{row.intake.name}</dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-muted">
            <FiUser aria-hidden />Class
          </dt>
          <dd className="mt-0.5 font-medium text-ink">
            {row.classGroup?.name ?? <span className="text-[#B4400F]">Not assigned</span>}
          </dd>
        </div>
        {canFinance && <div>
          <dt className="text-muted">Tuition</dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-ink">
            {rwf(money(row.totalFee))}
          </dd>
        </div>}
      </dl>

      <button
        type="button"
        onClick={() => onManage(row)}
        className="btn btn-sm mt-4 w-full rounded-full border-line bg-base-200 text-xs font-medium text-ink"
      >
        Manage enrolment
      </button>
    </li>
  );
}