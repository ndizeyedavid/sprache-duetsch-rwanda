import type { ClaimStatus } from '../../lib/payment-claims';
import { STATUS_CLASS,STATUS_LABEL } from './utils';

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  return <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[0.6875rem] font-semibold ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>;
}
