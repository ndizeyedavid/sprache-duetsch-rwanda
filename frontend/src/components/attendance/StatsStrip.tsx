type Props = { counts: Record<string, number>; total: number; rate: number };
export function StatsStrip({ counts, total }: Props) {
  const marked = total - counts.UNMARKED;
  return <div className="flex items-center gap-3"><progress className="progress h-1.5 max-w-40" value={marked} max={Math.max(total,1)} aria-label="Students marked"/><span className="text-xs text-muted">{marked} of {total} marked</span></div>;
}
