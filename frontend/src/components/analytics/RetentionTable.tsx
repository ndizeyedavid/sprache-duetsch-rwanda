import { Fragment } from 'react';
import type { RetentionCounts,RetentionIntake } from '../../lib/analytics-api';
import { formatPercent } from './format';

const COLUMNS: { key: keyof RetentionCounts; label: string; wide?: boolean }[] = [
  { key: 'enrolled', label: 'Enrolled' },
  { key: 'active', label: 'Active', wide: true },
  { key: 'completed', label: 'Completed', wide: true },
  { key: 'deferred', label: 'Deferred', wide: true },
  { key: 'withdrawn', label: 'Withdrawn' },
];

function Cells({ row }: { row: RetentionCounts }) {
  return (
    <>
      {COLUMNS.map(col => <td key={col.key} className={`text-right tabular-nums ${col.wide ? 'hidden sm:table-cell' : ''}`}>{row[col.key]}</td>)}
      <td className="text-right font-semibold tabular-nums">{formatPercent(row.retentionRate)}</td>
      <td className="hidden text-right tabular-nums sm:table-cell">{formatPercent(row.completionRate)}</td>
    </>
  );
}

/** Intake rows with their per-level breakdown underneath. */
export function RetentionTable({ intakes }: { intakes: RetentionIntake[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-muted">
            <th>Intake / level</th>
            {COLUMNS.map(col => <th key={col.key} className={`text-right ${col.wide ? 'hidden sm:table-cell' : ''}`}>{col.label}</th>)}
            <th className="text-right">Retention</th>
            <th className="hidden text-right sm:table-cell">Completion</th>
          </tr>
        </thead>
        <tbody>
          {intakes.map(row => (
            <Fragment key={row.intake.id}>
              <tr className="bg-base-200">
                <td className="font-semibold">{row.intake.name}{!row.intake.isActive ? <span className="badge badge-ghost badge-xs ml-2">Archived</span> : null}</td>
                <Cells row={row} />
              </tr>
              {row.levels.map(level => (
                <tr key={`${row.intake.id}-${level.level.id}`} className="text-xs">
                  <td className="pl-6 text-muted">{level.level.code} · {level.level.title}</td>
                  <Cells row={level} />
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
