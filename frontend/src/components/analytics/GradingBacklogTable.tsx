import type { BacklogRow } from '../../lib/analytics-api';
import { formatHours } from './format';

/** Waiting longer than three days is flagged. */
const STALE_HOURS = 72;

export function GradingBacklogTable({ rows }: { rows: BacklogRow[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-muted">
            <th>Teacher</th>
            <th className="text-right">To grade</th>
            <th className="hidden text-right sm:table-cell">Homework</th>
            <th className="hidden text-right sm:table-cell">Quizzes &amp; tests</th>
            <th className="hidden text-right sm:table-cell">Activities</th>
            <th className="text-right">Oldest wait</th>
            <th className="hidden text-right md:table-cell">Median turnaround</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const stale = (row.oldestWaitingHours ?? 0) >= STALE_HOURS;
            return (
              <tr key={row.teacher.id}>
                <td>
                  <span className="font-medium">{row.teacher.firstName} {row.teacher.lastName}</span>
                  <p className="text-xs text-muted">{row.classCount} active class{row.classCount === 1 ? '' : 'es'}</p>
                </td>
                <td className="text-right font-semibold tabular-nums">{row.total}</td>
                <td className="hidden text-right tabular-nums sm:table-cell">{row.homework}</td>
                <td className="hidden text-right tabular-nums sm:table-cell">{row.attempts}</td>
                <td className="hidden text-right tabular-nums sm:table-cell">{row.activities}</td>
                <td className="text-right">
                  {row.total ? <span className={`badge badge-soft badge-sm ${stale ? 'badge-error' : 'badge-ghost'}`}>{formatHours(row.oldestWaitingHours)}</span> : '—'}
                </td>
                <td className="hidden text-right tabular-nums md:table-cell">
                  {formatHours(row.medianTurnaroundHours)}
                  <span className="block text-[11px] text-muted">{row.gradedLast30Days} reviewed · 30d</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
