import { FiSend } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { listMyClaims } from '../../lib/payment-claims';
import type { PaymentMethod } from '../../lib/services/payment-method';
import { Panel } from '../ui/Panel';
import { MyPaymentReports } from './MyPaymentReports';
import { ReportPaymentForm } from './ReportPaymentForm';

type Props = { methods: PaymentMethod[]; balance: number; currency: string; onChanged: () => void };

/** For students who paid outside the app: report it, then follow its confirmation. */
export function ReportPaymentPanel({ methods, balance, currency, onChanged }: Props) {
  const claims = useApi('my-payment-claims', listMyClaims);
  const pending = claims.data?.filter((claim) => claim.status === 'PENDING').length ?? 0;
  return (
    <Panel>
      <div id="report-payment" className="scroll-mt-24">
        <h2 className="flex items-center gap-2 text-base font-semibold"><FiSend aria-hidden className="text-primary" />Paid another way?</h2>
        <p className="mt-1 text-xs text-muted">Paid by MoMo to the school number, bank transfer or cash at the desk? Tell finance here so they can confirm it and send your receipt.
          {pending ? ` ${pending} report${pending === 1 ? ' is' : 's are'} waiting for confirmation.` : ''}</p>
        <div className="mt-4"><ReportPaymentForm methods={methods} balance={balance} currency={currency} onSubmitted={() => { claims.refetch(); onChanged(); }} /></div>
        <MyPaymentReports claims={claims.data ?? []} onChanged={claims.refetch} />
      </div>
    </Panel>
  );
}
