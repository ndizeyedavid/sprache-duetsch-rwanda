import { FiCheckCircle,FiClock } from 'react-icons/fi';
import type { StudentPlacementResult } from '../../lib/services/placement-types';
import { SOURCE_LABEL } from './constants';
import { formatDate,levelName } from './utils';

type Props = { result: StudentPlacementResult; correct?: number; total?: number };

/** Score, recommended level and whether the academic office has confirmed a level yet. */
export function PlacementResultCard({ result, correct, total }: Props) {
  const confirmed = Boolean(result.assignedLevel);
  const rows = [
    { label: 'Recommended level', value: levelName(result.recommendedLevel) },
    { label: 'Your choice at registration', value: levelName(result.chosenLevel) },
    { label: 'Confirmed level', value: confirmed ? levelName(result.assignedLevel) : 'Awaiting confirmation' },
  ];
  return (
    <section className="card learning-panel gap-4 p-5 sm:p-6" aria-labelledby={`placement-result-${result.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted">{SOURCE_LABEL[result.source]} · {formatDate(result.createdAt)}</p>
          <h2 id={`placement-result-${result.id}`} className="mt-1 text-lg font-semibold">Your placement result</h2>
        </div>
        <span className={`badge gap-1 ${confirmed ? 'badge-success' : 'badge-warning'}`}>
          {confirmed ? <FiCheckCircle aria-hidden /> : <FiClock aria-hidden />}
          {confirmed ? 'Level confirmed' : 'Awaiting confirmation'}
        </span>
      </div>
      <div className="flex items-end gap-3">
        <p className="text-4xl font-bold leading-none">{result.score}%</p>
        {correct !== undefined && total ? <p className="pb-1 text-xs text-muted">{correct} of {total} correct</p> : null}
      </div>
      <progress className="progress progress-primary h-2 w-full" value={result.score} max={100} aria-label="Placement score" />
      <dl className="grid gap-2 sm:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-field bg-base-200 p-3">
            <dt className="text-[10px] text-muted">{row.label}</dt>
            <dd className="mt-1 text-sm font-semibold">{row.value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs leading-5 text-muted">
        {confirmed
          ? 'The academic office will use this level for your enrolment and contact you with the next steps.'
          : 'An academic admin will review your result and confirm your level. You will get a notification when it is done.'}
      </p>
    </section>
  );
}
