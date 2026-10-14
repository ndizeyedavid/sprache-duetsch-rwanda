import { Link } from 'react-router-dom';
import { currencyAmount } from '../../lib/format';
import type { PaymentCheckout } from '../../lib/paypack';
import { PaymentStatusBadge } from './PaymentStatusBadge';

/** The student's latest mobile-money payments. Public invoice pages hide the signed-in receipts link. */
export function PaymentRequestHistory({ rows, receiptsLink = true }: { rows: PaymentCheckout[]; receiptsLink?: boolean }) {
  if (!rows.length) return null;
  return (
    <section className="mt-6 border-t border-base-300 pt-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Mobile-money requests</h3>
        {receiptsLink ? <Link to="/profile?view=documents" className="text-sm font-medium text-brand hover:underline">Receipts</Link> : null}
      </div>
      <ul className="mt-3 divide-y divide-base-300">
        {rows.slice(0, 5).map(row => (
          <li key={row.id} className="flex items-center justify-between gap-3 py-3">
            <div>
              <p className="text-sm font-semibold tabular-nums">{currencyAmount(Number(row.amount), row.currency)}</p>
              <p className="text-xs text-muted">{new Date(row.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · {row.phone}</p>
            </div>
            <PaymentStatusBadge status={row.status} />
          </li>
        ))}
      </ul>
    </section>
  );
}
