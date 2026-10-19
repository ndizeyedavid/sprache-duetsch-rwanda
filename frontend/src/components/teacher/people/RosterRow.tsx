import { formatDistanceToNow } from 'date-fns';
import { FiAward,FiCheckSquare,FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { humanize } from '../../../lib/services';
import { StatusBadge } from '../../ui/StatusBadge';
import { MetricBar } from './MetricBar';
import type { RosterStudent } from './roster-data';

type Props = { row: RosterStudent; checked: boolean; threshold: number | null; classGroupId: string; onToggle: () => void; onMessage: () => void };

const action = 'btn btn-ghost btn-xs btn-circle border border-line';

/** One learner: identity, status, attendance and score bars, support flags and quick actions. */
export function RosterRow({ row, checked, threshold, classGroupId, onToggle, onMessage }: Props) {
  return (
    <li className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 border-t border-line px-4 py-3 first:border-t-0 lg:grid-cols-[auto_minmax(0,2.2fr)_7rem_minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,1.6fr)_auto] ${checked ? 'bg-brand-tint' : 'hover:bg-base-200'}`}>
      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" checked={checked} onChange={onToggle} aria-label={`Select ${row.name}`} />
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${row.risk?.level === 'HIGH' ? 'bg-primary text-primary-content' : 'bg-brand-soft text-brand-soft-ink'}`} aria-hidden>
          {row.firstName.charAt(0)}{row.lastName.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{row.name}</p>
          <p className="truncate text-xs text-muted">{row.email} · <span className="font-mono">{row.code}</span></p>
        </div>
      </div>
      <div className="flex gap-1 lg:order-last">
        <button type="button" className={action} onClick={onMessage} aria-label={`Message ${row.name}`} title="Message"><FiMessageCircle aria-hidden /></button>
        <Link to={`/teacher/attendance?classGroupId=${classGroupId}`} className={action} aria-label={`Attendance for ${row.name}`} title="Attendance"><FiCheckSquare aria-hidden /></Link>
        <Link to={`/teacher/grading?classGroupId=${classGroupId}`} className={action} aria-label={`Grade ${row.name}`} title="Grade"><FiAward aria-hidden /></Link>
      </div>
      <div className="col-span-3 flex flex-wrap items-center gap-x-4 gap-y-2 pl-9 lg:contents">
        <div><StatusBadge status={humanize(row.status)} className="px-3 py-1" /></div>
        <div className="min-w-32"><p className="mb-0.5 text-[0.625rem] uppercase tracking-wider text-muted lg:hidden">Attendance</p><MetricBar value={row.attendance?.percentage ?? null} alertBelow={threshold} label="Attendance" /></div>
        <div className="min-w-32"><p className="mb-0.5 text-[0.625rem] uppercase tracking-wider text-muted lg:hidden">Score</p><MetricBar value={row.score} alertBelow={50} label="Average score" /></div>
        <div className="flex min-w-0 flex-wrap items-center gap-1">
          {row.risk ? row.risk.reasons.map((reason) => (
            <span key={reason} className={`rounded-full px-2 py-0.5 text-[0.625rem] font-semibold ${row.risk?.level === 'HIGH' ? 'bg-primary text-primary-content' : 'border border-warning bg-base-100'}`}>{reason}</span>
          )) : <span className="text-[0.6875rem] text-muted">On track</span>}
          {row.lastActivityAt ? <span className="w-full text-[0.625rem] text-muted">Active {formatDistanceToNow(new Date(row.lastActivityAt), { addSuffix: true })}</span> : null}
        </div>
      </div>
    </li>
  );
}
