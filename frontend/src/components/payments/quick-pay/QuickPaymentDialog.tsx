import { FiCreditCard } from 'react-icons/fi';
import { currencyAmount } from '../../../lib/format';
import type { StudentRow } from '../../../lib/services/student-row';
import { Dialog } from '../../ui/overlay/Dialog';
import { useLastValue } from '../../ui/overlay/useLastValue';
import { balanceOf } from './quick-pay';
import { QuickPaymentFields } from './QuickPaymentFields';
import { useQuickPayment } from './useQuickPayment';

type Props = { student: StudentRow | null; onClose: () => void; onDone: (message: string) => void };
const FORM_ID = 'quick-payment-form';

/** Record a manual payment straight from the students list: one dialog, balance pre-filled. */
export function QuickPaymentDialog({ student: current, onClose, onDone }: Props) {
  const student = useLastValue(current);
  const info = student ? balanceOf(student) : null;
  const pay = useQuickPayment(current?.id ?? null, info, onDone);
  if (!student || !info) return null;
  const amount = Number(pay.values.amount) || 0;
  const chip = 'hero-chip px-2.5 py-0.5 text-[0.6875rem]';
  return (
    <Dialog open={Boolean(current)} onClose={onClose} busy={pay.busy} icon={FiCreditCard} size="md"
      title={`${student.user.firstName} ${student.user.lastName}`}
      subtitle={<span className="font-mono">{student.studentCode}</span>}
      meta={<>
        <span className={`${chip} hero-chip-solid`}>Owes {currencyAmount(info.balance, info.currency)}</span>
        <span className={chip}>Paid {currencyAmount(info.paid, info.currency)} of {currencyAmount(info.due, info.currency)}</span>
        {info.overdue > 0 ? <span className={chip}>{currencyAmount(info.overdue, info.currency)} overdue</span> : null}
      </>}
      footer={<>
        {amount > 0 && amount < info.balance ? <span className="mr-auto text-xs text-muted">{currencyAmount(info.balance - amount, info.currency)} will remain</span>
          : amount >= info.balance && amount > 0 ? <span className="mr-auto text-xs font-semibold text-success">Settles the balance</span> : null}
        <button type="button" className="btn btn-ghost btn-sm rounded-full" disabled={pay.busy} onClick={onClose}>Cancel</button>
        <button type="submit" form={FORM_ID} className="btn btn-primary btn-sm rounded-full px-5" disabled={pay.busy || amount <= 0 || !pay.values.methodId}>
          {pay.busy ? <span className="loading loading-spinner loading-xs" /> : null}Record {amount > 0 ? currencyAmount(amount, info.currency) : 'payment'}
        </button>
      </>}>
      <form id={FORM_ID} onSubmit={pay.submit}><QuickPaymentFields pay={pay} info={info} /></form>
    </Dialog>
  );
}
