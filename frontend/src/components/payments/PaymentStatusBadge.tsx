import type { PaymentCheckout } from '../../lib/paypack';

const states = {
  INITIATING: { label: 'Sending request', style: 'badge-info' },
  PENDING: { label: 'Awaiting approval', style: 'badge-warning' },
  UNKNOWN: { label: 'Needs confirmation', style: 'badge-warning' },
  SUCCESSFUL: { label: 'Paid', style: 'badge-success' },
  FAILED: { label: 'Unsuccessful', style: 'badge-error' },
};

export function PaymentStatusBadge({ status }: { status: PaymentCheckout['status'] }) {
  const state = states[status];
  return <span className={`badge badge-soft badge-sm whitespace-nowrap ${state.style}`}>{state.label}</span>;
}
