import { useState } from 'react';
import type { LevelItem } from '../../../lib/services/level-item';
import type { StaffPlacementResult } from '../../../lib/services/placement-types';
import { SOURCE_LABEL } from '../constants';
import { formatDate } from '../utils';
import { PlacementDecisionForm } from './PlacementDecisionForm';

type Props = { result: StaffPlacementResult; levels: LevelItem[]; onSaved: () => void };

function decisionBadge(result: StaffPlacementResult) {
  if (!result.assignedLevelId) return { label: 'Awaiting decision', tone: 'badge-warning' };
  return result.assignedLevelId === result.recommendedLevelId
    ? { label: 'Confirmed', tone: 'badge-success' }
    : { label: 'Overridden', tone: 'badge-info' };
}

/** One result: recommended vs chosen vs assigned, plus the decision form. */
export function PlacementResultItem({ result, levels, onSaved }: Props) {
  const [editing, setEditing] = useState(!result.assignedLevelId);
  const badge = decisionBadge(result);
  const columns = [
    { label: 'Recommended', value: result.recommendedLevel.code },
    { label: "Student's choice", value: result.chosenLevel?.code ?? '—' },
    { label: 'Assigned', value: result.assignedLevel?.code ?? '—' },
  ];
  return (
    <li className="space-y-3 rounded-box border border-base-300 p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs">
          <span className="text-lg font-bold">{result.score}%</span>
          <span className="ml-2 text-muted">{SOURCE_LABEL[result.source]} · {formatDate(result.createdAt)}</span>
        </p>
        <span className={`badge badge-sm ${badge.tone}`}>{badge.label}</span>
      </div>
      <dl className="grid grid-cols-3 gap-2">
        {columns.map((column) => (
          <div key={column.label} className="rounded-field bg-base-200 p-2">
            <dt className="text-[10px] text-muted">{column.label}</dt>
            <dd className="text-sm font-semibold">{column.value}</dd>
          </div>
        ))}
      </dl>
      {result.overrideReason ? <p className="text-xs"><span className="font-medium">Override reason:</span> {result.overrideReason}</p> : null}
      {result.note ? <p className="text-xs"><span className="font-medium">Note:</span> {result.note}</p> : null}
      {result.decidedAt ? (
        <p className="text-[11px] text-muted">
          Decided {formatDate(result.decidedAt)}{result.decidedBy ? ` by ${result.decidedBy.firstName} ${result.decidedBy.lastName}` : ''}
        </p>
      ) : null}
      {editing ? (
        <PlacementDecisionForm
          result={result}
          levels={levels}
          onSaved={() => { setEditing(false); onSaved(); }}
          onCancel={result.assignedLevelId ? () => setEditing(false) : undefined}
        />
      ) : (
        <button type="button" className="btn btn-xs btn-ghost rounded-full" onClick={() => setEditing(true)}>Change decision</button>
      )}
    </li>
  );
}
