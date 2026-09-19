import { FiAward, FiAlertTriangle, FiClipboard, FiLayers } from 'react-icons/fi';
import { StatTile } from '../ui/StatTile';

type Props = { total: number; graded: number; avg: number | null; passRate: number | null; atRisk: number; pending: number; actTotal: number; actGraded: number };

export function KpiStrip({ total, graded, avg, passRate, atRisk, pending, actTotal, actGraded }: Props) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <StatTile label="Exams" value={`${graded}/${total}`} tone="brand" icon={FiClipboard} delta={avg !== null ? `Avg ${avg}% · Pass ${passRate ?? '—'}%` : total ? `${pending} to grade` : undefined} />
      <StatTile label="Activities" value={`${actGraded}/${actTotal}`} tone="navy" icon={FiLayers} delta={actTotal ? `${actTotal - actGraded} pending` : undefined} />
      <StatTile label="Pass rate" value={passRate !== null ? `${passRate}%` : '—'} tone={passRate !== null && passRate < 50 ? 'coral' : 'brand'} icon={FiAward} delta={avg !== null ? `Avg ${avg}%` : undefined} />
      <StatTile label="At risk" value={String(atRisk)} tone={atRisk ? 'coral' : 'muted'} icon={FiAlertTriangle} delta={atRisk ? 'Needs attention' : 'All good'} />
    </div>
  );
}
