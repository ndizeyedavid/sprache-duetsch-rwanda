import { FiChevronRight } from 'react-icons/fi';
import type { ApiState } from '../../../hooks/useApi';
import type { PlacementQueueItem } from '../../../lib/services/placement-types';
import { ErrorBlock,LoadingBlock } from '../../common/PageState';
import { SOURCE_LABEL } from '../constants';
import { formatDate } from '../utils';

type Props = { queue: ApiState<PlacementQueueItem[]>; onSelect: (studentId: string) => void };

/** Results waiting for a staff decision (oldest first). */
export function PlacementQueue({ queue, onSelect }: Props) {
  if (queue.loading) return <LoadingBlock label="Loading results awaiting a decision…" />;
  if (queue.error || !queue.data) return <ErrorBlock message={queue.error ?? 'Could not load the queue.'} onRetry={queue.refetch} />;
  if (queue.data.length === 0) {
    return <p className="rounded-field border border-dashed border-base-300 p-4 text-center text-xs text-muted">No placement results are waiting for a decision.</p>;
  }
  return (
    <ul className="divide-y divide-base-300 rounded-box border border-base-300">
      {queue.data.map((row) => (
        <li key={row.id}>
          <button type="button" onClick={() => onSelect(row.student.id)} className="flex w-full items-center gap-3 p-3 text-left text-xs hover:bg-base-200">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold">{row.student.user.firstName} {row.student.user.lastName}</span>
              <span className="block text-muted">{row.student.studentCode} · {SOURCE_LABEL[row.source]} · {formatDate(row.createdAt)}</span>
            </span>
            <span className="text-right">
              <span className="block font-semibold">{row.score}% → {row.recommendedLevel.code}</span>
              <span className="block text-muted">Choice: {row.chosenLevel?.code ?? '—'}</span>
            </span>
            <FiChevronRight aria-hidden className="text-muted" />
          </button>
        </li>
      ))}
    </ul>
  );
}
