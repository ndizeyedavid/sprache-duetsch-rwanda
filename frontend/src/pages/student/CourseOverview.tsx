import { Link, useParams } from 'react-router-dom';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { rwf } from '../../lib/format';
import { getMyCourses, listLevels, money } from '../../lib/services';

export function CourseOverview() {
  const { slug = '' } = useParams();
  const levels = useApi('levels-catalog', listLevels);
  const mine = useApi('my-courses', getMyCourses);

  if (levels.loading) return <LoadingBlock label="Loading course…" />;
  if (levels.error || !levels.data) {
    return <ErrorBlock message={levels.error ?? 'Could not load this course.'} onRetry={levels.refetch} />;
  }

  const level = levels.data.find((item) => item.code.toLowerCase() === slug.toLowerCase());
  if (!level) {
    return <EmptyBlock title="Course not found" hint={`No level matches “${slug}”.`} />;
  }

  const enrolment = mine.data?.find((course) => course.level.id === level.id) ?? null;

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel className="lg:col-span-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand">
          {level.code} · {level.levelLabel}
        </p>
        <h1 className="mt-1 text-xl font-semibold sm:text-2xl">{level.title}</h1>
        {level.summary ? (
          <p className="mt-2 text-sm leading-relaxed text-muted">{level.summary}</p>
        ) : null}

        <h2 className="mt-6 text-base font-semibold">What you will learn</h2>
        {level.objectives.length === 0 ? (
          <p className="mt-2 text-xs text-muted">Objectives for this level are being finalised.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {level.objectives.map((objective) => (
              <li key={objective} className="flex items-start gap-2 text-sm">
                <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                {objective}
              </li>
            ))}
          </ul>
        )}

        {enrolment ? (
          <div className="mt-6">
            <StatusBadge
              status={`${enrolment.stats.completedLessons}/${enrolment.stats.totalLessons} lessons complete`}
            />
            <Link
              to={`/courses/${slug.toLowerCase()}/learn`}
              className="btn mt-4 rounded-full border-0 bg-brand text-white hover:bg-brand/90"
            >
              Continue learning
            </Link>
          </div>
        ) : (
          <p className="mt-6 text-xs text-muted">
            You are not enrolled in this level yet. Contact an academic admin to join.
          </p>
        )}
      </Panel>

      <Panel>
        <h2 className="text-base font-semibold">Course facts</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Tuition</dt>
            <dd className="font-semibold text-brand">
              {rwf(money(level.defaultFee))} {level.currency}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Language</dt>
            <dd className="font-medium">{level.language}</dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Status</dt>
            <dd>
              <StatusBadge status={level.isActive ? 'Active' : 'Inactive'} />
            </dd>
          </div>
          {enrolment ? (
            <div className="flex items-center justify-between gap-3">
              <dt className="text-muted">Progress</dt>
              <dd className="font-medium">{enrolment.stats.completionPercentage}%</dd>
            </div>
          ) : null}
        </dl>
      </Panel>
    </div>
  );
}
