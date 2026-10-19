/** Small labelled bar for a 0–100 value; red when under the alert line. */
export function MetricBar({ value, alertBelow, label }: { value: number | null; alertBelow?: number | null; label: string }) {
  if (value === null) return <span className="text-xs text-muted">—</span>;
  const low = alertBelow != null && value < alertBelow;
  return (
    <span className="flex min-w-24 items-center gap-2" aria-label={`${label} ${value}%`}>
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-base-200">
        <span className={`block h-full rounded-full ${low ? 'bg-error' : 'bg-primary'}`} style={{ width: `${Math.max(4, value)}%` }} />
      </span>
      <span className={`w-9 text-right text-xs font-semibold tabular-nums ${low ? 'text-error' : ''}`}>{value}%</span>
    </span>
  );
}
