import { FiArrowRight,FiCheckCircle,FiClipboard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { heroAction } from '../hero/hero-actions';
import { PageHero } from '../hero/PageHero';
import type { FeedItem } from './assignment-feed';
import { feedBucket } from './assignment-feed';

/** Assignments header: next task to work on plus to-do / feedback / graded counts. */
export function AssignmentHero({ items, loading = false }: { items: FeedItem[]; loading?: boolean }) {
  const todo = items.filter(i => feedBucket(i) === 'To do' || i.status === 'RETURNED');
  const next = todo.find(i => i.status === 'RETURNED') ?? todo[0];
  return (
    <PageHero
      eyebrow="Hausaufgaben · Your next small step"
      icon={FiClipboard}
      title="Assignments"
      description="A little writing, a little speaking, a little more confidence. Find your tasks, save your work, and learn from your teacher’s feedback."
      art="assignments"
      meta={loading ? null : <>
        <span className="hero-chip hero-chip-solid">{todo.length} to work on</span>
        <span className="hero-chip">{items.filter(i => i.status === 'SUBMITTED').length} awaiting feedback</span>
        <span className="hero-chip">{items.filter(i => i.status === 'GRADED').length} graded</span>
      </>}
      actions={loading ? null : next
        ? <Link to={`/assignments/${next.id}`} className={heroAction}>{next.status === 'RETURNED' ? 'Improve your work' : 'Continue learning'}<FiArrowRight aria-hidden /></Link>
        : <span className="hero-chip hero-chip-solid"><FiCheckCircle aria-hidden />You’re up to date. Well done.</span>}
    />
  );
}
