import { FiArrowRight,FiCheckCircle,FiClock,FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { FeedItem } from './assignment-feed';
import { feedBucket } from './assignment-feed';
export function AssignmentHero({ items }: { items: FeedItem[] }) {
  const todo = items.filter(i => feedBucket(i) === 'To do' || i.status === 'RETURNED');
  const next = todo.find(i => i.status === 'RETURNED') ?? todo[0];
  return <section className="card overflow-hidden border border-base-300 bg-base-100">
    <div className="relative grid items-center gap-4 p-6 sm:p-8 md:grid-cols-[1fr_220px]">
      <div className="relative z-10"><p className="text-[10px] font-semibold uppercase tracking-[.22em] text-primary">Your next small step</p><h1 className="mt-3 text-2xl font-bold sm:text-3xl">Put your German into practice.</h1><p className="mt-3 max-w-lg text-sm leading-7 text-muted">A little writing, a little speaking, a little more confidence. Find your tasks, save your work, and learn from your teacher’s feedback.</p>
        {next ? <Link to={`/assignments/${next.id}`} className="btn btn-primary btn-sm mt-5 rounded-full">{next.status === 'RETURNED' ? 'Improve your work' : 'Continue learning'}<FiArrowRight /></Link> : <p className="mt-5 text-sm font-medium text-success">You’re up to date. Well done.</p>}
      </div>
      <div className="relative hidden h-48 md:block"><div className="absolute inset-3 rounded-full bg-success text-success-content" /><img src="/illustrations/course-learner.webp" alt="" className="relative h-full w-full object-contain" /></div>
    </div>
    <div className="grid grid-cols-3 border-t border-base-300 bg-base-200 px-3 py-4 sm:px-8">{[{ label: 'To work on', value: todo.length, Icon: FiClock }, { label: 'Awaiting feedback', value: items.filter(i => i.status === 'SUBMITTED').length, Icon: FiMessageCircle }, { label: 'Graded', value: items.filter(i => i.status === 'GRADED').length, Icon: FiCheckCircle }].map(({ label, value, Icon }) => <div key={label} className="flex items-center justify-center gap-3 border-r border-base-300 last:border-0 sm:justify-start"><Icon className="hidden text-muted sm:block" /><div><p className="text-lg font-bold">{value}</p><p className="text-[10px] text-muted sm:text-xs">{label}</p></div></div>)}</div>
  </section>;
}
