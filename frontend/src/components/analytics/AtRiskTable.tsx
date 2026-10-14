import { Link } from 'react-router-dom';
import type { AtRiskRow } from '../../lib/analytics-api';
import { RISK_LABEL,SEVERITY_BADGE } from './constants';
import { formatPercent,sinceLabel } from './format';
import { RiskReasonBadges } from './RiskReasonBadges';

type Props = { rows: AtRiskRow[]; linkFor: (row: AtRiskRow) => string | null; compact?: boolean };

/** One row per enrolment; the less important columns collapse on phones. */
export function AtRiskTable({ rows, linkFor, compact = false }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-muted">
            <th>Student</th>
            <th>Risk</th>
            <th>Reasons</th>
            {!compact ? <th className="hidden text-right md:table-cell">Attendance</th> : null}
            {!compact ? <th className="hidden text-right md:table-cell">Avg score</th> : null}
            <th className="hidden lg:table-cell">Last active</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => {
            const to = linkFor(row);
            const name = `${row.student.firstName} ${row.student.lastName}`;
            return (
              <tr key={row.enrollmentId} className="align-top">
                <td className="min-w-40">
                  {to ? <Link to={to} className="link link-hover font-medium">{name}</Link> : <span className="font-medium">{name}</span>}
                  <p className="text-xs text-muted">{row.student.studentCode} · {row.classGroup?.name ?? `${row.level.code} (no class yet)`}</p>
                </td>
                <td><span className={`badge badge-sm ${SEVERITY_BADGE[row.riskLevel]}`}>{RISK_LABEL[row.riskLevel]}</span></td>
                <td className="min-w-44"><RiskReasonBadges reasons={row.reasons} /></td>
                {!compact ? (
                  <td className="hidden text-right tabular-nums md:table-cell">
                    {formatPercent(row.attendanceRate)}
                    <span className="block text-[11px] text-muted">needs {row.attendanceThreshold}%</span>
                  </td>
                ) : null}
                {!compact ? <td className="hidden text-right tabular-nums md:table-cell">{formatPercent(row.averageScore)}</td> : null}
                <td className="hidden whitespace-nowrap text-xs text-muted lg:table-cell">{sinceLabel(row.lastActivityAt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
