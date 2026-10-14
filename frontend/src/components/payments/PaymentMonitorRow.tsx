import { FiRefreshCw } from 'react-icons/fi';
import { currencyAmount } from '../../lib/format';
import { isUnresolved } from '../../lib/paypack';
import type { PaymentCheckout } from '../../lib/paypack';
import { PaypackCloseForm } from './PaypackCloseForm';
import { PaypackReconcileForm } from './PaypackReconcileForm';
import { PaymentStatusBadge } from './PaymentStatusBadge';

type Props = { row: PaymentCheckout; busy: boolean; onCheck: () => void; onDone: () => void };
export function PaymentMonitorRow({ row, busy, onCheck, onDone }: Props) {
  return <li className="py-4">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{row.student ? `${row.student.user.firstName} ${row.student.user.lastName}` : 'Student payment'}</p>
        <p className="mt-1 text-xs text-muted">{row.student?.studentCode} · {row.phone} · {new Date(row.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}</p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold tabular-nums">{currencyAmount(Number(row.amount), row.currency)}</span>
        <PaymentStatusBadge status={row.status} />
        {isUnresolved(row) && row.providerRef ? <button className="btn btn-sm min-h-10" disabled={busy} onClick={onCheck}>
          <FiRefreshCw className={busy ? 'animate-spin motion-reduce:animate-none' : ''} aria-hidden />{busy ? 'Checking…' : 'Check status'}</button> : null}
      </div>
    </div>
    <details className="mt-2 text-xs text-muted">
      <summary className="cursor-pointer">References{row.status === 'UNKNOWN' && !row.providerRef ? ' & recovery' : ''}</summary>
      <p className="mt-2 break-all">Request: {row.id}</p>
      {row.providerRef ? <p className="mt-1 break-all">Paypack: {row.providerRef}</p> : null}
      {row.status === 'UNKNOWN' && !row.providerRef ? <div className="mt-3"><PaypackReconcileForm id={row.id} onDone={onDone} /><PaypackCloseForm id={row.id} onDone={onDone} /></div> : null}
    </details>
  </li>;
}
