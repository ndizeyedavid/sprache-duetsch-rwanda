import type { EnrollmentRow } from '../../lib/services';
import { lastSeen } from './utils';

/** Lessons finished in this level and the student's last sign-in, from the e-learning side. */
export function LearningCell({ row }: { row: EnrollmentRow }) {
  if (!row.progress) return <span className="text-muted">—</span>;
  const { lessonsDone, lessonsTotal } = row.progress;
  return (
    <span className="block min-w-28">
      <span className="flex items-baseline justify-between gap-2">
        <span className="font-medium text-ink">{lessonsDone}/{lessonsTotal} lessons</span>
      </span>
      <progress className="progress progress-primary mt-1 h-1 w-full" value={lessonsDone} max={lessonsTotal || 1} aria-label={`${lessonsDone} of ${lessonsTotal} lessons finished`} />
      <span className={`mt-0.5 block text-[0.6875rem] ${row.lastLoginAt ? 'text-muted' : 'font-medium text-[#B4400F]'}`}>{lastSeen(row.lastLoginAt)}</span>
    </span>
  );
}
