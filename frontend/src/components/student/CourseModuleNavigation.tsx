import { FiArrowUpRight,FiCheck,FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../lib/services';

export function CourseModuleNavigation({ course }: { course: MyCourse }) {
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  const lessons = modules.flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order));
  const next = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED');
  const basePath = `/courses/${course.level.code.toLowerCase()}/learn`;

  return (
    <section className="card border border-base-300 bg-base-100 p-5 sm:p-7">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><FiLayers aria-hidden />Modules</h2>
        <Link to={basePath} className="btn btn-ghost btn-xs gap-2 rounded-full">Open lesson map <FiArrowUpRight aria-hidden /></Link>
      </div>
      <ol>
        {modules.map((module, index) => {
          const ordered = [...module.lessons].sort((a, b) => a.order - b.order);
          const done = ordered.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
          const complete = ordered.length > 0 && done === ordered.length;
          const current = ordered.some((lesson) => lesson.id === next?.id);
          const target = ordered.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? ordered.find((lesson) => lesson.progressStatus !== 'COMPLETED') ?? ordered[0];
          return (
            <li key={module.id} className="relative pb-3 last:pb-0">
              {index < modules.length - 1 ? <span aria-hidden className={`absolute bottom-0 left-5 top-8 w-px ${complete ? 'bg-primary' : 'border-l border-dashed border-base-content'}`} /> : null}
              <Link to={target ? `${basePath}/${target.id}` : basePath} aria-current={current ? 'step' : undefined}
                className={`group relative flex items-center gap-3 rounded-field p-2 transition-colors sm:gap-4 ${current ? 'bg-primary text-primary-content' : 'hover:bg-base-200'}`}>
                <span className={`relative z-10 grid size-6 shrink-0 place-items-center rounded-full border text-[10px] font-semibold ${complete || current ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100 text-muted'}`}>
                  {complete ? <FiCheck aria-hidden /> : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium">{module.title}</h3>
                  <div className="mt-1.5 flex items-center gap-3">
                    <progress className="progress progress-primary h-1 w-20 sm:w-28" value={done} max={ordered.length || 1} aria-label={`${module.title} progress`} />
                    <span className="text-[10px] text-muted">{done}/{ordered.length}</span>
                    {current ? <span className="text-[10px] font-medium text-primary">Current</span> : null}
                  </div>
                </div>
                <FiArrowUpRight aria-hidden className="shrink-0 text-muted" />
              </Link>
            </li>
          );
        })}
      </ol>
      {modules.length === 0 ? <p className="text-xs text-muted">Your modules will appear here.</p> : null}
    </section>
  );
}
