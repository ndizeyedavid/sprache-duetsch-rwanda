import type { LedgerRow } from './utils';

type Props = {
  rows: LedgerRow[];
  total: number;
  emptyLabel: string;
  /** Money in reads as brand, money out stays ink — never colour alone, the
   *  sign and the caption carry the meaning too. */
  tone?: 'brand' | 'ink';
};

export function LedgerList({ rows, total, emptyLabel, tone = 'ink' }: Props) {
  if (!rows.length) {
    return <p className="px-5 py-8 text-center text-xs text-muted">{emptyLabel}</p>;
  }

  return (
    <ul>
      {rows.map((row) => (
        <li
          key={row.id}
          className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-line px-5 py-3 last:border-0"
        >
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold">{row.title}</span>
            <span className="block text-xs text-muted">{row.meta}</span>
          </span>
          <span className={`shrink-0 text-sm font-semibold tabular-nums ${tone === 'brand' ? 'text-brand' : 'text-ink'}`}>
            {row.amount}
          </span>
        </li>
      ))}
      {total > rows.length ? (
        <li className="px-5 py-3 text-xs text-muted">
          Showing the {rows.length} most recent of {total}. Ask the finance office for the full statement.
        </li>
      ) : null}
    </ul>
  );
}
