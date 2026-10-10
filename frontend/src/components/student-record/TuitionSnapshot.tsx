import { FiDollarSign } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { humanize } from '../../lib/services/humanize';
import { money } from '../../lib/services/money';
import type { StudentDetail } from '../../lib/services/student-detail';
import { Panel } from '../ui/Panel';
import { ProgressBar } from '../ui/ProgressBar';
import { StatusBadge } from '../ui/StatusBadge';
import { shortDate } from './utils';

type Props = { finance: NonNullable<StudentDetail['finance']> | null | undefined; onOpen: () => void };

/** Finance roles only: the balance in one card, with the full ledger one click away. */
export function TuitionSnapshot({ finance, onOpen }: Props) {
  const due = money(finance?.totalDue);
  const paid = money(finance?.totalPaid);
  const currency = finance?.currency ?? 'RWF';
  const share = due > 0 ? Math.round((paid / due) * 100) : 0;

  return (
    <Panel>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiDollarSign aria-hidden className="text-brand" />Tuition
        </h2>
        {finance ? <StatusBadge status={humanize(finance.status)} className="px-3 py-1" /> : null}
      </div>
      {finance ? (
        <>
          <p className="mt-3 text-2xl font-semibold tabular-nums">{currencyAmount(money(finance.balance), currency)}</p>
          <p className="text-xs text-muted">balance · {currencyAmount(paid, currency)} paid of {currencyAmount(due, currency)}</p>
          <ProgressBar value={share} className="mt-3" />
          {finance.nextDueAt ? (
            <p className="mt-3 text-xs text-muted">Next due {shortDate(finance.nextDueAt)} · {currencyAmount(money(finance.nextDueAmount), currency)}</p>
          ) : null}
        </>
      ) : (
        <p className="mt-3 text-xs text-muted">No charges yet — tuition appears once the student is enrolled.</p>
      )}
      <button type="button" onClick={onOpen} className="btn btn-sm mt-4 w-full rounded-full">Open payments</button>
    </Panel>
  );
}
