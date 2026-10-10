import type { MyFinance } from '../../lib/services';
import { money } from '../../lib/services';
import { CourseFeeSummary } from '../payments/CourseFeeSummary';
import { PaymentRequestHistory } from '../payments/PaymentRequestHistory';
import { PaypackCheckout } from '../payments/PaypackCheckout';
import { usePaypackCheckout } from '../payments/usePaypackCheckout';
import { Panel } from '../ui/Panel';
import { SectionState } from './SectionState';

type Props = { finance: MyFinance | null; loading: boolean; error: string | null; onRetry: () => void };

/** Student payments: what is left for the course, and one way to pay it (Paypack mobile money). */
export function FinanceSection({ finance, loading, error, onRetry }: Props) {
  const checkout = usePaypackCheckout(onRetry);
  const account = finance?.finance ?? null;
  return (
    <SectionState loading={loading} loadingLabel="Loading your fees…" error={error} onRetry={onRetry}
      isEmpty={!account} emptyTitle="No course fees yet" emptyHint="Fees appear here once you join a course.">
      {finance && account ? (
        <Panel padded={false} className="p-3 sm:p-4">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <CourseFeeSummary finance={finance} />
            <div className="p-2 sm:p-3">
              <PaypackCheckout balance={Math.max(0, money(account.balance))} currency={account.currency} checkout={checkout} />
            </div>
          </div>
          <div className="px-2 pb-2 sm:px-3"><PaymentRequestHistory rows={checkout.rows} /></div>
        </Panel>
      ) : null}
    </SectionState>
  );
}
