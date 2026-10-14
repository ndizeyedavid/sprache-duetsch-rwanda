import type { IconType } from 'react-icons';
import { FiBriefcase,FiCreditCard,FiDollarSign,FiInfo,FiSmartphone } from 'react-icons/fi';
import type { PaymentMethod } from '../../lib/services/payment-method';

/** Configured methods that are not something a student can pay with. */
const NOT_PAYABLE = new Set(['SCHOLARSHIP', 'WAIVER', 'DISCOUNT']);

const ICONS: Record<string, IconType> = { MOMO: FiSmartphone, AIRTEL: FiSmartphone, BANK: FiBriefcase, CASH: FiDollarSign, CARD: FiCreditCard };

/** Shown only when finance has not written instructions for a method yet. */
const FALLBACK: Record<string, string> = {
  CASH: 'Pay at the campus finance office and ask for your receipt.',
  BANK: 'Ask the finance office for the school bank account details.',
  MOMO: 'Pay online with mobile money, or ask the finance office for the school pay code.',
  AIRTEL: 'Pay online with mobile money, or ask the finance office for the school pay code.',
  CARD: 'Pay by card at the campus finance office.',
};

type Props = { methods: PaymentMethod[]; studentCode: string | null; campusName: string | null };

/** Offline ways to pay (bank, MoMo code, cash, card), each with finance's own instructions. */
export function HowToPay({ methods, studentCode, campusName }: Props) {
  const payable = methods.filter(method => method.isActive !== false && !NOT_PAYABLE.has(method.code));
  return (
    <section aria-labelledby="how-to-pay" className="space-y-3">
      <div>
        <h2 id="how-to-pay" className="text-lg font-semibold">Other ways to pay</h2>
        <p className="mt-1 text-sm text-muted">
          The finance office records these payments for you; they then show in your history with a receipt.
        </p>
      </div>
      {studentCode ? (
        <p className="flex items-start gap-2 rounded-box bg-base-200 p-3 text-sm">
          <FiInfo aria-hidden className="mt-0.5 shrink-0 text-brand" />
          <span>Write your student ID <span className="font-mono font-semibold">{studentCode}</span> as the payment reference so we can match it to you.</span>
        </p>
      ) : null}
      {payable.length === 0 ? (
        <p className="text-sm text-muted">Please contact the finance office for payment details.</p>
      ) : (
        <ul className="divide-y divide-base-300 rounded-box border border-base-300">
          {payable.map(method => {
            const Icon = ICONS[method.code] ?? FiCreditCard;
            const text = method.instructions?.trim() || FALLBACK[method.code] || 'Ask the finance office how to pay with this method.';
            return (
              <li key={method.id} className="flex gap-3 p-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-base-200 text-muted"><Icon aria-hidden /></span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{method.name}</p>
                  <p className="mt-0.5 whitespace-pre-line break-words text-sm text-muted">{text}</p>
                  {method.code === 'CASH' && campusName ? <p className="mt-1 text-xs text-muted">Your campus: {campusName}</p> : null}
                  {method.requiresReference ? <p className="mt-1 text-xs text-muted">Keep the transaction reference; finance needs it to confirm your payment.</p> : null}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
