import { FiCompass } from 'react-icons/fi';
import type { MyProgressLevel } from '../../lib/services/my-progress-level';
import { ProgressSpine } from '../profile/ProgressSpine';
import { SectionState } from '../profile/SectionState';
import { levelTally } from '../profile/utils';
import { Panel } from '../ui/Panel';

type Props = { levels: MyProgressLevel[]; loading: boolean; error: string | null; onRetry: () => void };

/** Module-by-module completion for each enrolled level, as the student sees it but without the resume link. */
export function ProgressPanel({ levels, loading, error, onRetry }: Props) {
  const ordered = [...levels].sort((a, b) => a.level.order - b.level.order);
  const lessons = ordered.reduce((sum, level) => sum + levelTally(level).total, 0);

  return (
    <Panel>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <FiCompass aria-hidden className="text-brand" />Course progress
        </h2>
        {lessons ? <p className="text-xs text-muted">{lessons} published lessons</p> : null}
      </div>
      <div className="mt-4">
        <SectionState
          loading={loading}
          loadingLabel="Loading course progress…"
          error={error}
          onRetry={onRetry}
          isEmpty={!ordered.length}
          emptyTitle="No course progress yet"
          emptyHint="Progress appears once the student is enrolled and opens a lesson."
        >
          <div className="space-y-4">
            {ordered.map((level) => <ProgressSpine key={level.level.id} level={level} showResume={false} />)}
          </div>
        </SectionState>
      </div>
    </Panel>
  );
}
