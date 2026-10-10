import type { PaymentCheckout } from '../../lib/paypack';

const states = {
  INITIATING: { label: 'Sending', style: 'badge-info' },
  PENDING: { label: 'Waiting for approval', style: 'badge-warning' },
  UNKNOWN: { label: 'Being checked', style: 'badge-warning' },
  SUCCESSFUL: { label: 'Paid', style: 'badge-success' },
  FAILED: { label: 'Failed', style: 'badge-error' },
};

export function PaymentStatusBadge({ status }: { status: PaymentCheckout['status'] }) {
  const state = states[status];
  return <span className={`badge badge-soft badge-sm whitespace-nowrap ${state.style}`}>{state.label}</span>;
}
