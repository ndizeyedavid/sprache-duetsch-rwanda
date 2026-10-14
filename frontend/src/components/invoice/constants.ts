import type { InvoiceLineStatus } from '../../lib/invoice';

export const LINE_STATUS: Record<InvoiceLineStatus, { label: string; style: string }> = {
  PAID: { label: 'Paid', style: 'badge-success' },
  OVERDUE: { label: 'Overdue', style: 'badge-error' },
  PARTIALLY_PAID: { label: 'Part paid', style: 'badge-warning' },
  UPCOMING: { label: 'Due', style: 'badge-ghost' },
};

export const shortDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
