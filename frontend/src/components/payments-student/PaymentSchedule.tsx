import { currencyAmount } from '../../lib/format';
import { isoDate } from '../../lib/services/iso-date';
import { Panel } from '../ui/Panel';
import { StatusBadge } from '../ui/StatusBadge';
import type { ScheduleRow } from './schedule';
import { dueInWords,obligationLabel } from './schedule';

const COLUMNS = 'sm:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))_8rem]';

/** Each charge or installment: when it is due, what it costs, what is paid and what is left. */
export function PaymentSchedule({ rows }: { rows: ScheduleRow[] }) {
  return (
    <Panel padded={false}>
      <div className="border-b border-base-300 px-4 py-3 sm:px-5">
        <h2 className="text-sm font-semibold">Payment schedule</h2>
        <p className="text-xs text-muted">Payments count towards the earliest due fee first.</p>
      </div>
      {rows.length === 0 ? (
        <p className="px-5 py-8 text-center text-sm text-muted">No fees have been charged yet.</p>
      ) : (
        <>
          <div aria-hidden className={`hidden gap-3 border-b border-base-300 px-5 py-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-muted sm:grid ${COLUMNS}`}>
            <span>Fee and due date</span><span className="text-right">Amount</span><span className="text-right">Paid</span><span className="text-right">Left</span><span className="text-right">Status</span>
          </div>
          <ul className="divide-y divide-base-300">
            {rows.map(row => {
              const format = (value: number) => currencyAmount(value, row.currency);
              const late = row.status === 'OVERDUE';
              return (
                <li key={row.id} className={`grid gap-2 px-4 py-3 sm:items-center sm:gap-3 sm:px-5 ${COLUMNS}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-snug">{row.description}</p>
                      <p className={`text-xs ${late ? 'font-semibold text-error' : 'text-muted'}`}>
                        {row.dueAt ? `${isoDate(row.dueAt)}${row.remaining > 0 ? ` · ${dueInWords(row.dueAt)}` : ''}` : 'No due date'}
                      </p>
                    </div>
                    <StatusBadge status={obligationLabel(row.status)} className="px-2.5 py-1 sm:hidden" />
                  </div>
                  <dl className="contents text-xs sm:text-sm">
                    <MoneyCell label="Amount" value={format(row.amount)} />
                    <MoneyCell label="Paid" value={format(row.paid)} />
                    <MoneyCell label="Left" value={format(row.remaining)} strong={row.remaining > 0} />
                  </dl>
                  <div className="hidden justify-end sm:flex"><StatusBadge status={obligationLabel(row.status)} className="px-2.5 py-1" /></div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Panel>
  );
}

function MoneyCell({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between gap-3 sm:block sm:text-right">
      <dt className="text-muted sm:sr-only">{label}</dt>
      <dd className={`tabular-nums ${strong ? 'font-semibold' : ''}`}>{value}</dd>
    </div>
  );
}
