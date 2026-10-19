import { FiArrowRight,FiBookOpen,FiClock,FiFileText,FiLayers,FiUser,FiUsers,FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { LevelOverview } from '../../../lib/levels-overview';
import type { LevelItem } from '../../../lib/services';
import { studyTime } from '../module-card/module-stats';
import { LevelCardBand } from './LevelCardBand';

type Props = { level: LevelItem; stats: LevelOverview | undefined; onOpen: () => void };

const tile = 'rounded-box bg-base-200 px-3 py-2';

/** A level as a course: what's in it, how much is live, who is learning it, and a way into the studio. */
export function LevelCourseCard({ level, stats, onOpen }: Props) {
  const live = stats?.lessons ? Math.round((stats.publishedLessons / stats.lessons) * 100) : 0;
  return (
    <article className="card learning-panel overflow-hidden">
      <LevelCardBand level={level} cover={stats?.covers[0]} />
      <div className="card-body gap-4 p-6">
        <div>
          <h2 className="card-title text-lg leading-snug">{level.title}</h2>
          {level.summary ? <p className="mt-1 line-clamp-2 text-xs text-muted">{level.summary}</p> : null}
        </div>
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className={tile}><dt className="flex items-center gap-1 text-muted"><FiLayers aria-hidden />Modules</dt><dd className="mt-0.5 text-base font-semibold">{stats?.modules ?? '—'}</dd></div>
          <div className={tile}><dt className="flex items-center gap-1 text-muted"><FiBookOpen aria-hidden />Lessons live</dt><dd className="mt-0.5 text-base font-semibold">{stats ? `${stats.publishedLessons}/${stats.lessons}` : '—'}</dd></div>
          <div className={tile}><dt className="flex items-center gap-1 text-muted"><FiZap aria-hidden />Activities</dt><dd className="mt-0.5 text-base font-semibold">{stats?.activities ?? '—'}</dd></div>
          <div className={tile}><dt className="flex items-center gap-1 text-muted"><FiClock aria-hidden />Study time</dt><dd className="mt-0.5 text-base font-semibold">{stats ? studyTime(stats.minutes) : '—'}</dd></div>
        </dl>
        <div>
          <div className="flex justify-between text-[0.6875rem]"><span className="font-semibold">Curriculum published</span><span className="text-muted">{live}%</span></div>
          <progress className="progress progress-primary mt-1 h-1.5 w-full" value={live} max={100} aria-label={`${live}% of lessons published`} />
        </div>
        <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><FiUsers aria-hidden /><strong className="text-base-content">{stats?.students ?? 0}</strong> learners</span>
          <span className="inline-flex items-center gap-1"><FiLayers aria-hidden /><strong className="text-base-content">{stats?.classes ?? 0}</strong> classes</span>
          <span className="inline-flex items-center gap-1"><FiUser aria-hidden /><strong className="text-base-content">{stats?.teachers ?? 0}</strong> teachers</span>
          {level.coursebookUrl ? <span className="inline-flex items-center gap-1"><FiFileText aria-hidden />Coursebook PDF</span> : null}
        </p>
        <div className="mt-auto space-y-2">
          <button type="button" onClick={onOpen} className="btn btn-primary btn-sm w-full justify-between rounded-full">Open course studio <FiArrowRight aria-hidden /></button>
          <div className="flex gap-1.5">
            <Link to="/admin/classes" className="btn btn-ghost btn-xs rounded-full border border-line">Classes</Link>
            <Link to="/admin/enrolments" className="btn btn-ghost btn-xs rounded-full border border-line">Enrolments</Link>
          </div>
        </div>
      </div>
    </article>
  );
}
