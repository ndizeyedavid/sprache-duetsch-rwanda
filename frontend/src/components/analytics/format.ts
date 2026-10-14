import { formatDistanceToNowStrict } from 'date-fns';

/** 5.5 → "6h", 50 → "2d 2h", null → "—". */
export function formatHours(hours: number | null): string {
  if (hours === null) return '—';
  if (hours < 1) return '<1h';
  if (hours < 24) return `${Math.round(hours)}h`;
  const total = Math.round(hours);
  const days = Math.floor(total / 24);
  const rest = total % 24;
  return rest ? `${days}d ${rest}h` : `${days}d`;
}

export const formatPercent = (value: number | null) => (value === null ? '—' : `${Math.round(value)}%`);

export const sinceLabel = (iso: string | null) => (iso ? `${formatDistanceToNowStrict(new Date(iso))} ago` : 'Never');
