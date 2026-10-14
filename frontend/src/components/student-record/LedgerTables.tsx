import { currencyAmount } from '../../lib/format';
import { humanize } from '../../lib/services/humanize';
import { money } from '../../lib/services/money';
import type { PaymentRow } from '../../lib/services/payment-row';
import type { StudentCharge } from '../../lib/services/student-charge';
import { shortDate } from './utils';

export function ChargesTable({ rows }: { rows: StudentCharge[] }) {
  return (
    <table className="table table-sm w-full">
      <thead><tr className="text-muted"><th>Charge</th><th>Due</th><th className="text-right">Amount</th></tr></thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id} className="border-t border-line">
            <td><p className="font-medium">{row.description}</p><p className="text-xs text-muted">{humanize(row.type)}</p></td>
            <td className="whitespace-nowrap text-xs text-muted">{shortDate(row.dueDate)}</td>
            <td className="whitespace-nowrap text-right tabular-nums">{currencyAmount(money(row.amount), row.currency)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function PaymentsTable({ rows }: { rows: PaymentRow[] }) {
  return (
    <table className="table table-sm w-full">
      <thead><tr className="text-muted"><th>Paid</th><th>Method</th><th>Receipt</th><th className="text-right">Amount</th></tr></thead>
      <tbody>
        {rows.map((row) => {
          const refund = row.txnType === 'REFUND';
          return (
            <tr key={row.id} className="border-t border-line">
              <td className="whitespace-nowrap text-xs">{shortDate(row.paidAt)}{row.reference ? <p className="text-muted">{row.reference}</p> : null}</td>
              <td className="text-xs">{row.method?.name ?? '—'}</td>
              <td className="font-mono text-xs">{row.receipt?.receiptNumber ?? '—'}</td>
              <td className={`whitespace-nowrap text-right tabular-nums ${refund ? 'text-error' : ''}`}>
                {refund ? '−' : ''}{currencyAmount(money(row.amount), row.currency)}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
