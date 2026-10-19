import { FiArrowRight,FiBookOpen,FiClock,FiEdit2,FiZap } from 'react-icons/fi';
import type { ModuleItem } from '../../../lib/services';
import { ModuleCover } from './ModuleCover';
import { moduleStats,studyTime } from './module-stats';

type Props = { module: ModuleItem; number: string; onOpen: (id: string) => void; onEdit: (module: ModuleItem) => void };

/** A module as a course-book chapter: lesson photos, what's inside, how much is live, and a way in. */
export function ModuleCard({ module, number, onOpen, onEdit }: Props) {
  const stats = moduleStats(module);
  const share = stats.lessons ? Math.round((stats.published / stats.lessons) * 100) : 0;
  const preview = module.lessons.slice(0, 3);
  return (
    <article className="card overflow-hidden border border-line bg-base-100">
      <ModuleCover number={number} covers={stats.covers} published={module.isPublished} />
      <div className="flex grow flex-col gap-3 p-5">
        <div>
          <h3 className="text-base font-semibold leading-snug">{module.title}</h3>
          {module.description ? <p className="mt-1 line-clamp-2 text-xs text-muted">{module.description}</p> : null}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
          <span className="inline-flex items-center gap-1"><FiBookOpen aria-hidden />{stats.lessons} lessons</span>
          <span className="inline-flex items-center gap-1"><FiZap aria-hidden />{stats.activities} activities</span>
          <span className="inline-flex items-center gap-1"><FiClock aria-hidden />{studyTime(stats.minutes)}</span>
        </div>
        <div>
          <div className="flex justify-between text-[0.6875rem]"><span className="font-semibold">{stats.published}/{stats.lessons} lessons live</span><span className="text-muted">{share}%</span></div>
          <progress className="progress progress-primary mt-1 h-1.5 w-full" value={share} max={100} aria-label={`${share}% of lessons published`} />
        </div>
        {preview.length ? (
          <ol className="space-y-1 text-xs">
            {preview.map((lesson) => (
              <li key={lesson.id} className="flex items-center gap-2">
                <span className={`size-1.5 shrink-0 rounded-full ${lesson.isPublished ? 'bg-primary' : 'bg-base-300'}`} aria-hidden />
                <span className="truncate">{lesson.title}</span>
              </li>
            ))}
            {module.lessons.length > 3 ? <li className="pl-3.5 text-muted">+{module.lessons.length - 3} more</li> : null}
          </ol>
        ) : <p className="text-xs text-muted">No lessons yet — open the module to add the first one.</p>}
        <div className="mt-auto flex gap-2 pt-1">
          <button type="button" className="btn btn-primary btn-sm grow justify-between rounded-full" onClick={() => onOpen(module.id)}>Open module<FiArrowRight aria-hidden /></button>
          <button type="button" className="btn btn-sm btn-circle border-line bg-base-100" aria-label={`Edit module ${module.title}`} onClick={() => onEdit(module)}><FiEdit2 aria-hidden /></button>
        </div>
      </div>
    </article>
  );
}
