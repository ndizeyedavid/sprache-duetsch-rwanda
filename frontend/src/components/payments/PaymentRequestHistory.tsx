import { FiArrowUpRight, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { currencyAmount } from '../../lib/format';
import type { PaymentCheckout } from '../../lib/paypack';
import { PaymentStatusBadge } from './PaymentStatusBadge';

export function PaymentRequestHistory({ rows }: { rows: PaymentCheckout[] }) {
  if (!rows.length) return null;
  return <div className="mt-6 border-t border-base-300 pt-4">
    <h3 className="text-xs font-semibold uppercase tracking-wider text-base-content/60">Recent mobile-money payments</h3>
    <ul className="mt-2 divide-y divide-base-300">
      {rows.slice(0, 5).map(row => <li key={row.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
        <div className="flex items-center gap-3">
          <span className={`flex size-9 shrink-0 items-center justify-center rounded-full ${row.status === 'SUCCESSFUL' ? 'bg-success/10 text-success' : 'bg-base-200 text-base-content/60'}`}>
            {row.status === 'SUCCESSFUL' ? <FiCheckCircle aria-hidden /> : <FiArrowUpRight aria-hidden />}</span>
          <div><p className="text-sm font-semibold tabular-nums">{currencyAmount(Number(row.amount), row.currency)}</p>
            <p className="mt-0.5 text-xs text-base-content/60">{new Date(row.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })} · {row.phone}</p></div>
        </div>
        <div className="flex flex-wrap items-center gap-2"><PaymentStatusBadge status={row.status} />
          {row.status === 'SUCCESSFUL' ? <Link className="btn btn-ghost btn-sm" to="/profile?view=documents">Receipt<FiArrowUpRight aria-hidden /></Link> : null}</div>
      </li>)}
    </ul>
  </div>;
}
