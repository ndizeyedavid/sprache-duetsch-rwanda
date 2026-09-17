import { FiAward, FiAlertTriangle, FiCheckCircle, FiClipboard, FiUsers } from 'react-icons/fi';
import { StatTile } from '../ui/StatTile';

type Props = { total: number; graded: number; avg: number | null; passRate: number | null; atRisk: number; pending: number };

export function KpiStrip({ total, graded, avg, passRate, atRisk, pending }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatTile label="Submissions" value={String(total)} tone="navy" icon={FiClipboard} />
      <StatTile label="Graded" value={String(graded)} tone="brand" icon={FiCheckCircle} delta={total ? `${Math.round((graded / total) * 100)}%` : undefined} />
      <StatTile label="Avg score" value={avg !== null ? `${avg}%` : '—'} tone="sun" icon={FiAward} />
      <StatTile label="Pass rate" value={passRate !== null ? `${passRate}%` : '—'} tone={avg !== null && avg < 50 ? 'coral' : 'brand'} icon={FiAward} />
      <StatTile label="At risk" value={String(atRisk)} tone={atRisk ? 'coral' : 'muted'} icon={FiAlertTriangle} delta={atRisk ? 'Needs attention' : 'All good'} />
      <StatTile label="To grade" value={String(pending)} tone="sun" icon={FiUsers} />
    </div>
  );
}
