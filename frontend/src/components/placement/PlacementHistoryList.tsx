import type { StudentPlacementResult } from '../../lib/services/placement-types';
import { SOURCE_LABEL } from './constants';
import { formatDate } from './utils';

/** Earlier results for the student (newest first). */
export function PlacementHistoryList({ history }: { history: StudentPlacementResult[] }) {
  return (
    <section className="card learning-panel gap-3 p-5">
      <h3 className="text-sm font-semibold">Placement history</h3>
      <ul className="divide-y divide-base-300">
        {history.map((row) => (
          <li key={row.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs">
            <span>
              <span className="font-semibold">{row.score}%</span> · {SOURCE_LABEL[row.source]}
              <span className="block text-muted">{formatDate(row.createdAt)}</span>
            </span>
            <span className="text-right">
              Recommended {row.recommendedLevel.code}
              <span className="block text-muted">{row.assignedLevel ? `Confirmed ${row.assignedLevel.code}` : 'Awaiting confirmation'}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
