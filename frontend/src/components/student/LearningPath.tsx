import { FiArrowRight, FiCheck, FiFlag, FiPlay } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../lib/services';
import { Panel } from '../ui/Panel';

export function LearningPath({ course }: { course: MyCourse }) {
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  const currentId = modules.find((module) => module.lessons.some((lesson) => lesson.progressStatus !== 'COMPLETED'))?.id;
  const basePath = `/courses/${course.level.code.toLowerCase()}/learn`;

  return (
    <Panel className="overflow-hidden sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-base-content/55">One step closer</p>
          <h2 className="mt-1 text-xl font-semibold">Your learning path</h2>
          <p className="mt-1 text-xs text-base-content/65">{course.level.code} · {course.level.title}</p>
        </div>
        <Link to={basePath} className="btn btn-ghost btn-sm rounded-full">All lessons <FiArrowRight aria-hidden /></Link>
      </div>
      <div className="mb-5 mt-6 flex items-center gap-4">
        <progress className="progress progress-success h-2 flex-1" value={course.stats.completionPercentage} max={100} aria-label="Course completion" />
        <span className="text-xs font-semibold">{course.stats.completionPercentage}% complete</span>
      </div>
      {modules.length === 0 ? <p className="py-6 text-sm text-base-content/65">Your teacher is preparing your first modules. Check back soon.</p> : (
        <ol aria-label="Course modules" className="relative">
          {modules.map((module, index) => {
            const lessons = [...module.lessons].sort((a, b) => a.order - b.order);
            const completed = lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
            const done = lessons.length > 0 && completed === lessons.length;
            const current = module.id === currentId;
            const next = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS')
              ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED') ?? lessons[0];
            return (
              <li key={module.id} className="relative flex gap-4 pb-5 last:pb-0" aria-current={current ? 'step' : undefined}>
                {index < modules.length - 1 ? <span aria-hidden className={`absolute bottom-0 left-5 top-10 w-px ${done ? 'bg-success/50' : 'border-l border-dashed border-base-content/20'}`} /> : null}
                <span className={`relative z-10 mt-1 grid size-10 shrink-0 place-items-center rounded-full border text-sm ${done ? 'border-success/30 bg-success/15 text-base-content' : current ? 'border-base-content bg-base-content text-base-100 ring-4 ring-base-content/5' : 'border-base-300 bg-base-100 text-base-content/50'}`}>
                  {done ? <FiCheck aria-hidden /> : current ? <FiPlay aria-hidden /> : String(index + 1).padStart(2, '0')}
                </span>
                <div className={`min-w-0 flex-1 rounded-field border p-4 ${current ? 'border-base-content/15 bg-base-200/70' : 'border-transparent'}`}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-base-content/55">Module {index + 1}</span>
                    <span className="text-[11px] font-medium text-base-content/65">{done ? 'Completed' : current ? 'Your next step' : 'Coming up'}</span>
                  </div>
                  <h3 className="mt-1 text-sm font-semibold">{module.title}</h3>
                  <p className="mt-1 text-xs text-base-content/60">{completed} of {lessons.length} lessons completed</p>
                  {next ? <Link to={`${basePath}/${next.id}`} className={`btn btn-sm mt-3 rounded-full ${current ? 'btn-neutral' : 'btn-ghost'}`}>
                    {done ? 'Revisit module' : current ? 'Continue module' : 'View module'} <FiArrowRight aria-hidden />
                  </Link> : null}
                </div>
              </li>
            );
          })}
        </ol>
      )}
      <div className="mt-6 flex items-center gap-3 border-t border-base-300/70 pt-5 text-xs text-base-content/65">
        <FiFlag aria-hidden className="text-lg" /> {course.stats.completedLessons} lessons completed. Every step counts.
      </div>
    </Panel>
  );
}
