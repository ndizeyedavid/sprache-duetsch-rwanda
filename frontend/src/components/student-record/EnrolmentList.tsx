import { FiLayers } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { humanize } from '../../lib/services/humanize';
import { money } from '../../lib/services/money';
import type { StudentDetail } from '../../lib/services/student-detail';
import { EmptyBlock } from '../common/PageState';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import { shortDate } from './utils';

type Props = {
  enrollments: StudentDetail['enrollments'];
  /** Overview shows the first few (active first); the Courses tab shows them all. */
  limit?: number;
  action?: { label: string; onClick: () => void };
};

/** Every level the student has been enrolled in. Fees appear only when the API sent them (finance roles). */
export function EnrolmentList({ enrollments, limit, action }: Props) {
  const ordered = limit ? [...enrollments].sort((a, b) => Number(b.status === 'ACTIVE') - Number(a.status === 'ACTIVE')).slice(0, limit) : enrollments;
  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiLayers aria-hidden className="text-brand" />Enrolments
        </h2>
        {action ? (
          <button type="button" onClick={action.onClick} className="text-xs font-semibold text-brand hover:underline">{action.label}</button>
        ) : null}
      </div>
      {enrollments.length === 0 ? (
        <div className="mt-3"><EmptyBlock title="Not enrolled yet" hint="Enrol this student from the Enrolments page." /></div>
      ) : (
        <ul className="mt-3 space-y-2">
          {ordered.map((row) => (
            <li key={row.id} className="flex flex-wrap items-center gap-3 rounded-box border border-line p-3">
              <span className="grid h-11 min-w-11 shrink-0 place-items-center whitespace-nowrap rounded-xl bg-brand px-2 text-xs font-bold text-white">{row.level.code}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{row.level.title}</p>
                <p className="text-xs text-muted">
                  {[row.classGroup?.name ?? 'No class', row.intake?.name].filter(Boolean).join(' · ')}
                </p>
                <p className="text-xs text-muted">
                  Enrolled {shortDate(row.enrolledAt)}{row.completedAt ? ` · completed ${shortDate(row.completedAt)}` : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <StatusBadge status={humanize(row.status)} className="px-3 py-1" />
                {row.totalFee === undefined ? null : (
                  <span className="text-xs text-muted tabular-nums">{currencyAmount(money(row.totalFee) - money(row.discountTotal), row.currency)}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}
