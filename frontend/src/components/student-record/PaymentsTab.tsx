import { useState } from 'react';
import { FiCheckCircle,FiCreditCard,FiFileText } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { currencyAmount } from '../../lib/format';
import { listStudentCharges,listStudentPayments } from '../../lib/services/list-student-money';
import { money } from '../../lib/services/money';
import type { StudentDetail } from '../../lib/services/student-detail';
import { MarkPaidDialog } from '../payment-claims/MarkPaidDialog';
import { SectionState } from '../profile/SectionState';
import { Panel } from '../ui/Panel';
import { StatTile } from '../ui/StatTile';
import { ChargesTable,PaymentsTable } from './LedgerTables';

type Props = { studentId: string; finance: StudentDetail['finance']; who: { name: string; code: string }; onChanged: () => void };

export function PaymentsTab({ studentId, finance, who, onChanged }: Props) {
  const [markingPaid, setMarkingPaid] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const charges = useApi(`student-charges-${studentId}`, () => listStudentCharges(studentId));
  const payments = useApi(`student-payments-${studentId}`, () => listStudentPayments(studentId));
  const currency = finance?.currency ?? 'RWF';
  const amount = (value: Parameters<typeof money>[0]) => currencyAmount(money(value), currency);

  const balance = money(finance?.balance);
  return (
    <div className="space-y-4">
      {balance > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-box border border-line bg-base-100 p-4">
          <p className="text-sm"><strong>{amount(finance?.balance)}</strong> still to pay. Paid in cash, by bank or MoMo outside the gateway?</p>
          <button type="button" className="btn btn-primary btn-sm gap-1 rounded-full" onClick={() => { setNotice(null); setMarkingPaid(true); }}><FiCheckCircle aria-hidden />Mark as paid</button>
        </div>
      ) : null}
      {notice ? <p role="status" className="alert alert-success alert-soft text-xs">{notice}</p> : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Total due" value={amount(finance?.totalDue)} delta={money(finance?.totalDiscount) ? `${amount(finance?.totalDiscount)} discount` : undefined} />
        <StatTile label="Paid" value={amount(finance?.totalPaid)} />
        <StatTile label="Balance" value={amount(finance?.balance)} tone={money(finance?.balance) > 0 ? 'coral' : 'brand'} />
        <StatTile label="Overdue" value={amount(finance?.overdueAmount)} tone={money(finance?.overdueAmount) > 0 ? 'coral' : 'brand'} />
      </div>
      <div className="grid items-start gap-4 lg:grid-cols-2">
        <Panel>
          <h2 className="flex items-center gap-2 text-sm font-semibold"><FiFileText aria-hidden className="text-brand" />Charges</h2>
          <div className="mt-3 overflow-x-auto">
            <SectionState loading={charges.loading} loadingLabel="Loading charges…" error={charges.error} onRetry={charges.refetch} isEmpty={!charges.data?.length} emptyTitle="No charges">
              <ChargesTable rows={charges.data ?? []} />
            </SectionState>
          </div>
        </Panel>
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold"><FiCreditCard aria-hidden className="text-brand" />Payments</h2>
            <Link to="/admin/transactions" className="text-xs font-semibold text-brand hover:underline">Record a payment</Link>
          </div>
          <div className="mt-3 overflow-x-auto">
            <SectionState loading={payments.loading} loadingLabel="Loading payments…" error={payments.error} onRetry={payments.refetch} isEmpty={!payments.data?.length} emptyTitle="No payments yet">
              <PaymentsTable rows={payments.data ?? []} />
            </SectionState>
          </div>
        </Panel>
      </div>
      <MarkPaidDialog open={markingPaid} onClose={() => setMarkingPaid(false)}
        student={{ id: studentId, name: who.name, code: who.code, balance, currency }}
        onDone={(message) => { setMarkingPaid(false); setNotice(message); payments.refetch(); onChanged(); }} />
    </div>
  );
}
