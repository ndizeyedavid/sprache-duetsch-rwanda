import { lateDuration, scoreAfterPenalty } from '../homework/late-policy';
import type { Lateness } from '../homework/types';

export type PenaltyChoice = { on: boolean; percent: string; reason: string };
type Props = { lateness: Lateness | null | undefined; total: number; maxPoints: string | number; value: PenaltyChoice; onChange: (v: PenaltyChoice) => void; disabled: boolean };

/** Shows the late penalty the server will apply, with an audited way to waive or change it for this student. */
export function LatePenaltyPanel({ lateness, total, maxPoints, value, onChange, disabled }: Props) {
  if (!lateness?.lateByMinutes) return null;
  if (!lateness.isLate) return <p className="text-xs text-muted">Handed in {lateDuration(lateness.lateByMinutes)} after the deadline, within the grace period. No penalty.</p>;
  const percent = value.on ? Number(value.percent || 0) : lateness.penaltyPercent;
  return (
    <div className="space-y-3 rounded-field border border-warning p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold">Late by {lateDuration(lateness.lateByMinutes)} · {lateness.penaltyPercent}% late penalty</p>
        <p className="text-xs">Final score: <strong>{scoreAfterPenalty(total, percent)}/{maxPoints}</strong> <span className="text-muted">({total} − {percent}%)</span></p>
      </div>
      <label className="flex items-center gap-2 text-xs">
        <input type="checkbox" className="checkbox checkbox-xs" disabled={disabled} checked={value.on} onChange={e => onChange({ ...value, on: e.target.checked, percent: e.target.checked ? '0' : value.percent })} />
        Waive or change the penalty for this student
      </label>
      {value.on ? (
        <div className="grid gap-2 sm:grid-cols-[120px_minmax(0,1fr)]">
          <label className="flex items-center gap-1 text-xs"><input type="number" aria-label="Penalty percent" className="input input-sm w-20" min={0} max={100} step={0.5} disabled={disabled} value={value.percent} onChange={e => onChange({ ...value, percent: e.target.value })} />%</label>
          <input className="input input-sm w-full" aria-label="Reason for changing the penalty" maxLength={500} disabled={disabled} placeholder="Reason (required, kept in the audit log)" value={value.reason} onChange={e => onChange({ ...value, reason: e.target.value })} />
        </div>
      ) : null}
    </div>
  );
}
