import { FiArrowUpRight,FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { DailyWordCard } from './DailyWordCard';
import { progressNudge } from './progress-stats';

type Props = { weekly: number; streak: number; left: number; total: number; to: string };

/** Friendly nudge on top, learner photo below growing into whatever height the panel has spare. */
export function ProgressMotivation({ weekly, streak, left, total, to }: Props) {
  const nudge = progressNudge({ weekly, streak, left, total });
  return (
    <div className="flex min-h-72 flex-1 flex-col overflow-hidden rounded-box bg-brand-tint">
      <div className="flex flex-wrap items-start justify-between gap-3 p-4 pb-0">
        <div className="min-w-0 flex-1">
          <p className="text-lg font-semibold leading-tight text-primary">{nudge.heading}</p>
          <p className="mt-1 text-xs leading-5 text-muted">{nudge.text}</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-base-100 px-2.5 py-1 text-[0.6875rem] font-semibold">
          <FiZap aria-hidden className="text-primary" />{streak} {streak === 1 ? 'day' : 'days'} streak
        </span>
      </div>
      {left ? (
        <Link to={to} className="btn btn-primary btn-xs mx-4 mt-3 w-fit gap-1 rounded-full px-3">
          Continue learning <FiArrowUpRight aria-hidden />
        </Link>
      ) : null}
      <DailyWordCard />
      <div className="relative mt-2 min-h-40 flex-1">
        <img src="/heroes/courses.webp" alt="" aria-hidden width={699} height={640} loading="lazy" decoding="async"
          className="pointer-events-none absolute inset-0 h-full w-full object-contain object-bottom" />
      </div>
    </div>
  );
}
