import { FiCompass } from 'react-icons/fi';
import type { MyProgressLevel } from '../../lib/services';
import { Panel } from '../ui/Panel';
import { ProgressSpine } from './ProgressSpine';
import { SectionState } from './SectionState';
import { levelTally } from './utils';

type Props = {
  levels: MyProgressLevel[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
};

export function ProgressSection({ levels, loading, error, onRetry }: Props) {
  const ordered = [...levels].sort((a, b) => a.level.order - b.level.order);
  const lessons = ordered.reduce((sum, level) => sum + levelTally(level).total, 0);

  return (
    <Panel>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <FiCompass aria-hidden className="text-brand" />Learning journey
        </h2>
        {lessons ? <p className="text-xs text-muted">{lessons} lessons across {ordered.length} level{ordered.length === 1 ? '' : 's'}</p> : null}
      </div>

      <div className="mt-4">
        <SectionState
          loading={loading}
          loadingLabel="Loading your progress…"
          error={error}
          onRetry={onRetry}
          isEmpty={!ordered.length}
          emptyTitle="No course progress yet"
          emptyHint="Open My Course and start your first lesson to start tracking progress."
        >
          <div className="space-y-4">
            {ordered.map((level) => (
              <ProgressSpine key={level.level.id} level={level} />
            ))}
          </div>
        </SectionState>
      </div>
    </Panel>
  );
}
