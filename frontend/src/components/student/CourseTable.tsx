import { FiArrowUpRight,FiSearch } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { currencyAmount } from '../../lib/format';
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
        <p className="text-sm text-base-content/65">{filtered.length} {filtered.length === 1 ? 'course' : 'courses'}</p>
        <label className="input flex w-full items-center gap-2 rounded-full border-base-300 bg-base-100/80 sm:w-72">
          <FiSearch aria-hidden className="shrink-0 text-base-content/50" />
          <input aria-label="Search courses" value={q} onChange={(event) => onQ(event.currentTarget.value)} placeholder="Find your course…" className="min-w-0 grow text-sm" />
          {q ? <button type="button" aria-label="Clear search" onClick={() => onQ('')} className="btn btn-ghost btn-xs btn-circle">×</button> : null}
        </label>
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course) => {
          const done = course.stats.completionPercentage === 100;
          const path = course.paymentRequired ? '/profile?view=payments' : `/courses/${course.level.code.toLowerCase()}`;
          return (
            <article key={course.level.id} className={`card learning-panel overflow-hidden ${course.paymentRequired ? 'bg-base-200 text-base-content/60' : ''}`}>
              <div className={`journey-hero relative flex h-44 items-center overflow-hidden p-6 ${course.paymentRequired ? 'grayscale opacity-60' : ''}`}>
                <span aria-hidden className="absolute -right-6 bottom-0 size-44 rounded-full bg-success/10" />
                <div className="relative z-10 w-[45%]">
                  <p className="max-w-28 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-primary-content">Continue</p>
                  <p className="mt-1 text-5xl font-semibold tracking-tight">{course.level.code}</p>
                </div>
                <img
                  src="/illustrations/course-learner.webp"
                  alt=""
                  aria-hidden="true"
                  width={480}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute bottom-0 right-1 h-42 w-[55%] object-contain object-bottom"
                />
              </div>
              <div className="card-body gap-3 p-6">
                <div className="flex items-center justify-between gap-2 text-xs text-base-content/60">
                  <span>{course.level.levelLabel}</span>
                  <span className={`badge badge-soft badge-sm ${course.paymentRequired ? 'badge-warning' : ''}`}>{course.paymentRequired ? 'Payment required' : done ? 'Completed' : 'Enrolled'}</span>
                </div>
                <h2 className="card-title text-lg">{course.paymentRequired ? <span>{course.level.title}</span> : <Link to={path} className="hover:underline">{course.level.title}</Link>}</h2>
                <p className="text-xs leading-6 text-base-content/65">{course.modules.length} modules · {course.stats.totalLessons} lessons</p>
                {course.price ? <p className="text-xs text-base-content/60">Course tuition: <strong>{currencyAmount(Number(course.price), course.currency ?? 'RWF')}</strong></p> : null}
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-base-content/65">{course.stats.completedLessons} lessons completed</span>
                  <span className="font-semibold">{course.stats.completionPercentage}%</span>
                </div>
                <progress className="progress progress-success h-1.5" value={course.stats.completionPercentage} max={100} aria-label={`${course.level.code} completion`} />
                {course.paymentRequired ? <p className="text-xs leading-5 text-base-content/60">Pay the course fee to open lessons and tests.</p> : null}
                <Link to={path} className="btn mt-3 justify-between rounded-full border-base-300 bg-base-100">{course.paymentRequired ? 'Pay course fee' : 'Open course'} <FiArrowUpRight aria-hidden /></Link>
              </div>
            </article>
          );
        })}
      </div>
      {filtered.length === 0 ? <p className="rounded-box border border-dashed border-base-300 p-10 text-center text-sm text-base-content/65">No courses match your search. Try another title or filter.</p> : null}
    </div>
  );
}
