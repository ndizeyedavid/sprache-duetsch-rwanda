import { Link } from 'react-router-dom';
import { Panel, SectionHeader } from '../../components/ui/Panel';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { rwf } from '../../lib/format';
import { getMyCourses, listLevels, money } from '../../lib/services';

export function Courses() {
  const levels = useApi('levels-catalog', listLevels);
  const mine = useApi('my-courses', getMyCourses);

  return (
    <div className="space-y-5">
      <Panel>
        <SectionHeader title="My Levels" action={{ label: 'Dashboard', to: '/dashboard' }} />
        {mine.loading ? (
          <LoadingBlock label="Loading your enrolments…" />
        ) : mine.error ? (
          <ErrorBlock message={mine.error} onRetry={mine.refetch} />
        ) : !mine.data || mine.data.length === 0 ? (
          <EmptyBlock title="No enrolments yet" hint="An academic admin will enrol you in a level after registration." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {mine.data.map((course) => (
              <article key={course.level.id} className="card-shadow rounded-box bg-base-200 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {course.level.code} · {course.level.levelLabel}
                </p>
                <h3 className="mt-1 text-sm font-semibold">{course.level.title}</h3>
                <div className="mt-3">
                  <ProgressBar value={course.stats.completionPercentage} tone="brand" />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {course.stats.completedLessons}/{course.stats.totalLessons} lessons complete
                </p>
                <Link
                  to={`/courses/${course.level.code.toLowerCase()}/learn`}
                  className="btn btn-sm mt-4 w-full rounded-full border-0 bg-brand text-white hover:bg-brand/90"
                >
                  Continue learning
                </Link>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel>
        <SectionHeader title="All Levels" action={{ label: 'Dashboard', to: '/dashboard' }} />
        {levels.loading ? (
          <LoadingBlock label="Loading levels…" />
        ) : levels.error || !levels.data ? (
          <ErrorBlock message={levels.error ?? 'Could not load levels.'} onRetry={levels.refetch} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {levels.data.map((level) => (
              <article key={level.id} className="card-shadow flex flex-col rounded-box bg-base-100 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
                  {level.code} · {level.levelLabel}
                </p>
                <h3 className="mt-1 text-sm font-semibold leading-snug">{level.title}</h3>
                {level.summary ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">{level.summary}</p>
                ) : null}
                <p className="mt-3 text-sm font-semibold text-brand">
                  {rwf(money(level.defaultFee))} <span className="text-xs font-normal text-muted">{level.currency}</span>
                </p>
                <Link
                  to={`/courses/${level.code.toLowerCase()}`}
                  className="btn btn-sm mt-4 w-full rounded-full border-brand bg-transparent text-brand hover:border-brand hover:bg-brand hover:text-white"
                >
                  View Details
                </Link>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
