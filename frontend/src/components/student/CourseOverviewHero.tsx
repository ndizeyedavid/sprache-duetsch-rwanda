import type { CSSProperties } from 'react';
import { FiArrowRight, FiClock, FiPlay } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { LevelItem, MyCourse } from '../../lib/services';

type Props = { level: LevelItem; course: MyCourse | null };

export function CourseOverviewHero({ level, course }: Props) {
  const modules = [...(course?.modules ?? [])].sort((a, b) => a.order - b.order);
  const lessons = modules.flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order));
  const next = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED');
  const completion = Math.min(100, Math.max(0, course?.stats.completionPercentage ?? 0));
  const path = `/courses/${level.code.toLowerCase()}/learn`;

  return (
    <section className="card overflow-hidden border border-base-300/70 bg-base-100">
      <div className="flex flex-wrap items-center gap-5 p-5 sm:p-7">
        <div aria-hidden className="journey-hero flex size-20 shrink-0 flex-col items-center justify-center rounded-2xl border border-base-300/50 sm:size-24">
          <img src="/illustrations/study-books.webp" alt="" width={400} height={366} className="h-12 w-16 object-contain" /><span className="text-3xl font-semibold tracking-tight">{level.code}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-base-content/60">{level.language} · {level.levelLabel}</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">{level.title}</h2>
          {level.summary ? <p className="mt-2 max-w-xl text-xs leading-6 text-base-content/65">{level.summary}</p> : null}
        </div>
        {course ? <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
          <div className="radial-progress text-primary" style={{ '--value': completion, '--size': '4.5rem', '--thickness': '4px' } as CSSProperties} role="progressbar" aria-valuenow={completion} aria-valuemin={0} aria-valuemax={100} aria-label="Course completed">
            <span className="text-base font-semibold text-base-content">{completion}%</span>
          </div>
          <span className="text-[11px] text-base-content/60">{course.stats.completedLessons}/{course.stats.totalLessons} lessons</span>
        </div> : null}
      </div>
      {course ? <div className="flex flex-wrap items-center justify-between gap-4 border-t border-base-300/70 bg-base-200/40 px-5 py-4 sm:px-7">
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-base-100"><FiPlay className="text-sm" /></span>
          <div>
            <p className="text-[10px] font-medium uppercase tracking-widest text-base-content/55">{next ? 'Up next' : lessons.length ? 'Course complete' : 'Your course'}</p>
            <h3 className="mt-0.5 text-sm font-semibold">{next?.title ?? (lessons.length ? 'Ready for a review?' : 'Lessons coming soon')}</h3>
            {next?.estimatedMinutes ? <p className="mt-1 flex items-center gap-1 text-[11px] text-base-content/60"><FiClock aria-hidden />{next.estimatedMinutes} min</p> : null}
          </div>
        </div>
        <Link to={next ? `${path}/${next.id}` : path} className="btn btn-primary btn-sm w-full gap-3 rounded-full px-5 sm:w-auto">
          {next ? course.stats.completedLessons || next.progressStatus === 'IN_PROGRESS' ? 'Continue' : 'Start learning' : lessons.length ? 'Review lessons' : 'View course'}<FiArrowRight aria-hidden />
        </Link>
      </div> : <p className="border-t border-base-300 px-5 py-4 text-sm text-base-content/65">Contact your academic admin to enrol.</p>}
    </section>
  );
}
