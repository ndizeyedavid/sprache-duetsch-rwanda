import { Link } from 'react-router-dom';
import { FiArrowUpRight, FiBookOpen, FiSearch } from 'react-icons/fi';
import type { MyCourse } from '../../lib/services';

type Props = {
  courses: MyCourse[];
  filter: 'all' | 'enrolled' | 'completed';
  onFilter: (filter: 'all' | 'enrolled' | 'completed') => void;
  q: string;
  onQ: (value: string) => void;
};

export function CourseTable({ courses, filter, q, onQ }: Props) {
  const filtered = courses.filter((course) => {
    const done = course.stats.completionPercentage === 100;
    if (filter === 'completed' && !done) return false;
    if (filter === 'enrolled' && done) return false;
    return `${course.level.code} ${course.level.title} ${course.level.levelLabel}`.toLowerCase().includes(q.trim().toLowerCase());
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-base-content/65">{filtered.length} {filtered.length === 1 ? 'course' : 'courses'} in your learning space</p>
        <label className="input flex w-full items-center gap-2 rounded-full border-base-300 bg-base-100/80 sm:w-72">
          <FiSearch aria-hidden className="shrink-0 text-base-content/50" />
          <input aria-label="Search courses" value={q} onChange={(event) => onQ(event.currentTarget.value)} placeholder="Find your course…" className="min-w-0 grow text-sm" />
          {q ? <button type="button" aria-label="Clear search" onClick={() => onQ('')} className="btn btn-ghost btn-xs btn-circle">×</button> : null}
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => {
          const done = course.stats.completionPercentage === 100;
          const path = `/courses/${course.level.code.toLowerCase()}`;
          return (
            <article key={course.level.id} className="card learning-panel overflow-hidden">
              <div className="journey-hero relative flex h-40 items-center justify-between overflow-hidden p-6">
                <span aria-hidden className="absolute -right-5 -top-12 size-48 rounded-full border-[24px] border-base-content/5" />
                <div className="relative">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-base-content/60">Your next chapter</p>
                  <p className="mt-1 text-5xl font-semibold tracking-tight">{course.level.code}</p>
                </div>
                <FiBookOpen aria-hidden className="relative text-4xl text-base-content/40" />
              </div>
              <div className="card-body gap-3 p-6">
                <div className="flex items-center justify-between gap-2 text-xs text-base-content/60">
                  <span>{course.level.levelLabel}</span>
                  <span className="badge badge-soft badge-sm">{done ? 'Completed' : 'Enrolled'}</span>
                </div>
                <h2 className="card-title text-lg"><Link to={path} className="hover:underline">{course.level.title}</Link></h2>
                <p className="text-xs leading-6 text-base-content/65">{course.modules.length} modules · {course.stats.totalLessons} lessons</p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-base-content/65">{course.stats.completedLessons} lessons completed</span>
                  <span className="font-semibold">{course.stats.completionPercentage}%</span>
                </div>
                <progress className="progress progress-success h-1.5" value={course.stats.completionPercentage} max={100} aria-label={`${course.level.code} completion`} />
                <Link to={path} className="btn mt-3 justify-between rounded-full border-base-300 bg-base-100">View learning path <FiArrowUpRight aria-hidden /></Link>
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 ? <p className="rounded-box border border-dashed border-base-300 p-10 text-center text-sm text-base-content/65">No courses match your search. Try another title or filter.</p> : null}
    </div>
  );
}
