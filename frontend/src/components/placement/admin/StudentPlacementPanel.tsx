import { useState } from 'react';
import { useApi } from '../../../hooks/useApi';
import type { LevelItem } from '../../../lib/services/level-item';
import { getStudentPlacements } from '../../../lib/services/placement-api';
import { ErrorBlock,LoadingBlock } from '../../common/PageState';
import { levelName } from '../utils';
import { ManualPlacementForm } from './ManualPlacementForm';
import { PlacementResultItem } from './PlacementResultItem';

type Props = { studentId: string; levels: LevelItem[]; onChanged: () => void };

/** One student's placement history with decisions, plus manual entry. */
export function StudentPlacementPanel({ studentId, levels, onChanged }: Props) {
  const placements = useApi(`student-placements-${studentId}`, () => getStudentPlacements(studentId), Boolean(studentId));
  const [message, setMessage] = useState<string | null>(null);
  const refresh = () => { placements.refetch(); onChanged(); };

  if (placements.loading) return <LoadingBlock label="Loading placement history…" />;
  if (placements.error || !placements.data) {
    return <ErrorBlock message={placements.error ?? 'Could not load placements.'} onRetry={placements.refetch} />;
  }
  const { student, results } = placements.data;

  return (
    <div className="space-y-4">
      <div className="grid gap-2 text-xs sm:grid-cols-3">
        <p className="rounded-field bg-base-200 p-2"><span className="block text-[10px] text-muted">Student's choice</span>{levelName(student.intendedLevel)}</p>
        <p className="rounded-field bg-base-200 p-2"><span className="block text-[10px] text-muted">Current level</span>{levelName(student.currentLevel)}</p>
        <p className="rounded-field bg-base-200 p-2"><span className="block text-[10px] text-muted">Latest score</span>{student.placementScore === null ? 'Not tested' : `${student.placementScore}%`}</p>
      </div>
      {results.length === 0 ? (
        <p className="rounded-field border border-dashed border-base-300 p-4 text-center text-xs text-muted">No placement results yet. The student can take the online test, or record one below.</p>
      ) : (
        <ul className="space-y-3">
          {results.map((result) => <PlacementResultItem key={result.id} result={result} levels={levels} onSaved={refresh} />)}
        </ul>
      )}
      <details className="collapse collapse-arrow rounded-box border border-base-300">
        <summary className="collapse-title min-h-0 py-3 text-sm font-semibold">Record a placement manually</summary>
        <div className="collapse-content">
          <ManualPlacementForm studentId={studentId} levels={levels} onSaved={(text) => { setMessage(text); refresh(); }} />
        </div>
      </details>
      {message ? <p role="status" className="alert alert-success alert-soft text-xs">{message}</p> : null}
    </div>
  );
}
