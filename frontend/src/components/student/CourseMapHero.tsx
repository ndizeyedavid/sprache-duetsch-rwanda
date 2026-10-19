import { FiArrowLeft,FiGrid,FiList,FiMap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../lib/services';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

export type CourseLayout = 'vertical' | 'horizontal';

type Props = { slug: string; course?: MyCourse | null; layout?: CourseLayout; onLayout?: (layout: CourseLayout) => void };

/** Compact header for the lesson map: progress chips and the Path / Study switch. */
export function CourseMapHero({ slug, course, layout, onLayout }: Props) {
  const code = course?.level.code ?? slug.toUpperCase();
  const toggle = (value: CourseLayout, label: string, Icon: typeof FiList) => (
    <button type="button" aria-pressed={layout === value} onClick={() => onLayout?.(value)} className={layout === value ? heroAction : heroGhost}>
      <Icon aria-hidden />{label}
    </button>
  );
  return (
    <PageHero
      compact
      eyebrow={`${code} · Lesson map`}
      icon={FiMap}
      title={course?.level.title ?? `Deutsch ${code}`}
      art="courses"
      meta={course ? <>
        <span className="hero-chip hero-chip-solid">{course.stats.completionPercentage}% complete</span>
        <span className="hero-chip">{course.stats.completedLessons}/{course.stats.totalLessons} lessons</span>
      </> : null}
      actions={<>
        {course && onLayout ? <span role="group" aria-label="Course layout" className="flex flex-wrap gap-2">{toggle('vertical', 'Path', FiList)}{toggle('horizontal', 'Study', FiGrid)}</span> : null}
        <Link to={`/courses/${slug.toLowerCase()}`} className={heroGhost}><FiArrowLeft aria-hidden />{code} overview</Link>
      </>}
    />
  );
}
