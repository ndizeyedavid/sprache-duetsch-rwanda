import { FiArrowLeft,FiArrowRight,FiBookOpen,FiClock,FiMap,FiPlay } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { LevelItem,MyCourse } from '../../lib/services';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

type Props = { level: LevelItem; course: MyCourse | null };

const backLink = <Link to="/courses" className={heroGhost}><FiArrowLeft aria-hidden />My courses</Link>;

/** Shown while the course loads, so the header never jumps. */
export function CourseOverviewHeroPlaceholder({ code }: { code: string }) {
  return <PageHero eyebrow={`${code.toUpperCase()} · Course`} icon={FiBookOpen} title={`Deutsch ${code.toUpperCase()}`} art="courses" actions={backLink} />;
}

/** Course overview header: level, summary, progress chips, continue action and an "Up next" strip. */
export function CourseOverviewHero({ level, course }: Props) {
  const modules = [...(course?.modules ?? [])].sort((a, b) => a.order - b.order);
  const lessons = modules.flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order));
  const next = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED');
  const completion = Math.min(100, Math.max(0, course?.stats.completionPercentage ?? 0));
  const path = `/courses/${level.code.toLowerCase()}/learn`;
  const label = next ? course?.stats.completedLessons || next.progressStatus === 'IN_PROGRESS' ? 'Continue' : 'Start learning' : lessons.length ? 'Review lessons' : 'View course';

  return (
    <PageHero
      eyebrow={`${level.code} · ${level.language} · ${level.levelLabel}`}
      icon={FiBookOpen}
      title={level.title}
      description={level.summary}
      art="courses"
      meta={course ? <>
        <span className="hero-chip hero-chip-solid">{completion}% complete</span>
        <span className="hero-chip">{course.stats.completedLessons}/{course.stats.totalLessons} lessons</span>
        <span className="hero-chip">{modules.length} modules</span>
      </> : null}
      actions={<>
        {course ? <Link to={next ? `${path}/${next.id}` : path} className={heroAction}>{label}<FiArrowRight aria-hidden /></Link> : null}
        {course ? <Link to={path} className={heroGhost}><FiMap aria-hidden />Lesson map</Link> : null}
        {backLink}
      </>}
      footer={course ? (
        <div className="flex min-w-0 items-center gap-3">
          <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-base-200"><FiPlay className="text-sm" /></span>
          <div className="min-w-0">
            <p className="text-[0.625rem] font-medium uppercase tracking-widest text-muted">{next ? 'Up next' : lessons.length ? 'Course complete' : 'Your course'}</p>
            <p className="mt-0.5 truncate text-sm font-semibold">{next?.title ?? (lessons.length ? 'Ready for a review?' : 'Lessons coming soon')}</p>
          </div>
          {next?.estimatedMinutes ? <span className="ml-auto flex shrink-0 items-center gap-1 text-[0.6875rem] text-muted"><FiClock aria-hidden />{next.estimatedMinutes} min</span> : null}
        </div>
      ) : <p className="text-sm text-muted">Contact your academic admin to enrol.</p>}
    />
  );
}
