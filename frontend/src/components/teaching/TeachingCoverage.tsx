import { CoverageToggle } from './CoverageToggle';
import type { Coverage,CoverageFilter } from './types';

type TeachingCoverageProps = {
  coverage: Coverage;
  filter: CoverageFilter;
  onFilter: (next: CoverageFilter) => void;
};

const label = 'text-[11px] font-semibold uppercase tracking-wide text-muted';
const cell = 'flex flex-col bg-base-100 px-4 py-4';

/**
 * Coverage at a glance. The two cells that mean work is waiting are buttons, so
 * the count doubles as the way to filter down to exactly those classes.
 */
export function TeachingCoverage({ coverage, filter, onFilter }: TeachingCoverageProps) {
  const staffedShare =
    coverage.classes === 0 ? 0 : Math.round((coverage.staffed / coverage.classes) * 100);

  return (
    <section
      aria-label="Teaching coverage"
      className="learning-panel grid grid-cols-2 gap-px overflow-hidden rounded-box bg-base-300 sm:grid-cols-4"
    >
      <div className={cell}>
        <p className={label}>Teachers</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
          {coverage.activeTeachers}
          <span className="text-base font-medium text-muted"> / {coverage.teachers}</span>
        </p>
        <p className="mt-0.5 text-[11px] leading-4 text-muted">
          active accounts you can assign
        </p>
      </div>

      <div className={cell}>
        <p className={label}>Classes staffed</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-ink">
          {coverage.staffed}
          <span className="text-base font-medium text-muted"> / {coverage.classes}</span>
        </p>
        <div
          className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-200"
          role="presentation"
        >
          <div className="h-full rounded-full bg-brand" style={{ width: `${staffedShare}%` }} />
        </div>
        <p className="mt-1.5 text-[11px] leading-4 text-muted">
          {staffedShare}% of active classes covered
        </p>
      </div>

      <CoverageToggle
        label="Unstaffed"
        value={coverage.unstaffed}
        note={coverage.unstaffed > 0 ? 'Tap to filter the classes' : 'every active class has a teacher'}
        active={filter === 'unstaffed'}
        onToggle={() => onFilter(filter === 'unstaffed' ? '' : 'unstaffed')}
      />

      <CoverageToggle
        label="No approved teacher"
        value={coverage.blocked}
        note={
          coverage.blocked > 0
            ? 'No active teacher is approved for their level'
            : 'every level has an approved teacher'
        }
        active={filter === 'blocked'}
        onToggle={() => onFilter(filter === 'blocked' ? '' : 'blocked')}
      />
    </section>
  );
}