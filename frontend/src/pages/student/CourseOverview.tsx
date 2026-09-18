import { Link, useParams } from 'react-router-dom';
import { FiArrowRight, FiBookOpen, FiCheckCircle, FiClock } from 'react-icons/fi';
import { Panel } from '../../components/ui/Panel';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyBlock, ErrorBlock, LoadingBlock } from '../../components/common/PageState';
import { useApi } from '../../hooks/useApi';
import { rwf } from '../../lib/format';
import { getMyCourses, listLevels, money } from '../../lib/services';
import { COLORS } from '../../lib/theme';

function colorFor(code: string): string {
  const palette = [COLORS.brand, '#5b8def', COLORS.sun, COLORS.coral, '#4cbc9a'];
  let h = 0;
  for (let i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) >>> 0;
  return palette[h % palette.length];
}

export function CourseOverview() {
  const { slug = '' } = useParams();
  const levels = useApi('levels-catalog', listLevels);
  const mine = useApi('my-courses', getMyCourses);

  if (levels.loading) return <LoadingBlock label="Loading course…" />;
  if (levels.error || !levels.data) return <ErrorBlock message={levels.error ?? 'Could not load course.'} onRetry={levels.refetch} />;

  const level = levels.data.find((l) => l.code.toLowerCase() === slug.toLowerCase());
  if (!level) return <EmptyBlock title="Course not found" hint={`No level matches “${slug}”.`} />;

  const enrol = mine.data?.find((c) => c.level.id === level.id) ?? null;
  const accent = colorFor(level.code);

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted"><Link to="/courses" className="hover:underline">My courses</Link> · <span className="font-semibold text-ink">{level.code}</span></div>

      <div className="overflow-hidden rounded-box border border-line bg-base-100">
        <div className="h-1.5 w-full" style={{ background: accent }} aria-hidden />
        <div className="p-6">
          <p className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" style={{ background: `${accent}14`, color: accent }}><FiBookOpen aria-hidden />{level.code} · {level.levelLabel}</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight">{level.title}</h1>
          {level.summary ? <p className="mt-2 text-sm leading-relaxed text-muted">{level.summary}</p> : null}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-base-200 px-3 py-1 font-medium">{level.language}</span>
            <span className="rounded-full bg-base-200 px-3 py-1 font-medium">{level.isActive ? 'Active' : 'Inactive'}</span>
            <span className="rounded-full px-3 py-1 font-semibold text-white" style={{ background: accent }}>{rwf(money(level.defaultFee))} {level.currency}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {enrol ? (
              <>
                <Link to={`/courses/${slug.toLowerCase()}/learn`} className="btn gap-1 rounded-full border-0 text-white hover:opacity-90" style={{ background: accent }}>Continue learning <FiArrowRight aria-hidden /></Link>
                <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-3 py-1 text-xs font-medium"><FiClock aria-hidden />{enrol.stats.completedLessons}/{enrol.stats.totalLessons} · {enrol.stats.completionPercentage}%</span>
                <Link to="/dashboard" className="btn btn-sm rounded-full border-line bg-base-100">Dashboard</Link>
              </>
            ) : (
              <span className="rounded-full bg-sun-soft px-3 py-1 text-xs font-semibold text-[#8A6800]">Not enrolled — contact academic admin</span>
            )}
          </div>
          {enrol ? <div className="mt-4"><ProgressBar value={enrol.stats.completionPercentage} tone="brand" /></div> : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2">
          <h2 className="flex items-center gap-2 text-sm font-bold"><FiCheckCircle aria-hidden className="text-brand" />What you will learn</h2>
          {level.objectives.length === 0 ? <p className="mt-2 text-xs text-muted">Objectives are being finalised.</p> : (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {level.objectives.map((o) => (
                <li key={o} className="flex items-start gap-2 rounded-box border border-line bg-base-100 px-3 py-2 text-sm">
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full" style={{ background: accent }} />
                  {o}
                </li>
              ))}
            </ul>
          )}
          {enrol ? <div className="mt-4"><StatusBadge status={`${enrol.stats.completedLessons}/${enrol.stats.totalLessons} lessons`} /></div> : null}
        </Panel>

        <Panel>
          <h2 className="text-sm font-bold">Course facts</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3"><dt className="text-muted">Tuition</dt><dd className="font-bold" style={{ color: accent }}>{rwf(money(level.defaultFee))} {level.currency}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-muted">Language</dt><dd className="font-medium">{level.language}</dd></div>
            <div className="flex items-center justify-between gap-3"><dt className="text-muted">Status</dt><dd><StatusBadge status={level.isActive ? 'Active' : 'Inactive'} /></dd></div>
            {enrol ? <div className="flex items-center justify-between gap-3"><dt className="text-muted">Progress</dt><dd className="font-bold">{enrol.stats.completionPercentage}%</dd></div> : null}
          </dl>
          <Link to="/courses" className="btn btn-sm mt-4 w-full rounded-full border-line bg-base-100">Back to My courses</Link>
        </Panel>
      </div>
    </div>
  );
}
