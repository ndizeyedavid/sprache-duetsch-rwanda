import { FiArrowUpRight,FiBookOpen,FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../lib/services';
import { heroAction,heroGhost } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';

export type CourseFilter = 'all' | 'enrolled' | 'completed';
const FILTERS: { key: CourseFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'enrolled', label: 'In progress' },
  { key: 'completed', label: 'Completed' },
];

type Props = {
  courses: MyCourse[];
  filter: CourseFilter;
  counts: Record<CourseFilter, number>;
  onFilter: (filter: CourseFilter) => void;
};

/** "My courses" header: filter chips with counts, continue + join actions. */
export function CoursesHero({ courses, filter, counts, onFilter }: Props) {
  const current = courses.find((course) => !course.paymentRequired && course.stats.completionPercentage < 100);
  return (
    <PageHero
      eyebrow="Meine Kurse"
      icon={FiBookOpen}
      title="My courses"
      description="Continue a course, or open a finished one to revise."
      art="courses"
      meta={courses.length ? FILTERS.map(({ key, label }) => (
        <button key={key} type="button" aria-pressed={filter === key} onClick={() => onFilter(key)}
          className={`hero-chip cursor-pointer ${filter === key ? 'hero-chip-solid' : ''}`}>
          {label}<span className="tabular-nums">{counts[key]}</span>
        </button>
      )) : null}
      actions={<>
        {current ? <Link to={`/courses/${current.level.code.toLowerCase()}/learn`} className={heroAction}>Continue {current.level.code}<FiArrowUpRight aria-hidden /></Link> : null}
        <a href="#join-course" className={current ? heroGhost : heroAction}><FiPlus aria-hidden />Join a course</a>
      </>}
    />
  );
}
