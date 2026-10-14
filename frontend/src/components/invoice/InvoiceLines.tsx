import { currencyAmount } from '../../lib/format';
import type { PublicInvoice } from '../../lib/invoice';
import { money } from '../../lib/services/money';
import { LINE_STATUS, shortDate } from './constants';

type Props = { lines: PublicInvoice['lines']; currency: string };

/** One row per charge: what it is, when it is due, and what is still open on it. */
export function InvoiceLines({ lines, currency }: Props) {
  if (!lines.length) return <p className="py-6 text-center text-sm text-muted">No charges on this account yet.</p>;
  return (
    <ul className="divide-y divide-base-300">
      {lines.map(line => {
        const status = LINE_STATUS[line.status];
        const outstanding = money(line.outstanding);
        return (
          <li key={line.id} className="flex items-start justify-between gap-4 py-4">
            <div className="min-w-0">
              <p className="text-sm font-medium">{line.description}</p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <span>Due {shortDate(line.dueAt)}</span>
                <span className={`badge badge-sm ${status.style}`}>{status.label}</span>
              </p>
            </div>
            <div className="shrink-0 text-right tabular-nums">
              <p className="text-sm font-semibold">{currencyAmount(money(line.amount), currency)}</p>
              {outstanding > 0 && outstanding < money(line.amount)
                ? <p className="mt-1 text-xs text-muted">{currencyAmount(outstanding, currency)} open</p> : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
