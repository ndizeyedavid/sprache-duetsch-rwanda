import type { MyCourse } from '../../lib/services';

/** One slim bar per enrolled course, so progress reads per level instead of one blended number. */
export function CourseProgressBars({ courses }: { courses: MyCourse[] }) {
  const visible = courses.filter((course) => !course.paymentRequired && course.stats.totalLessons > 0);
  if (!visible.length) return null;
  return (
    <ul className="space-y-3" aria-label="Progress per course">
      {visible.map(({ level, stats }) => (
        <li key={level.id}>
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-brand px-2 py-0.5 text-[0.625rem] font-bold text-primary-content">{level.code}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{level.title}</span>
            <span className="shrink-0 text-muted">{stats.completedLessons}/{stats.totalLessons}</span>
          </div>
          <progress className="progress progress-primary mt-1.5 h-1.5 w-full" value={stats.completionPercentage} max={100}
            aria-label={`${level.code}: ${stats.completionPercentage}% complete`} />
        </li>
      ))}
    </ul>
  );
}
