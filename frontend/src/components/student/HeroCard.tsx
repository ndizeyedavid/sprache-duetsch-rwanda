import { Link } from 'react-router-dom';
import { FiArrowRight, FiBookOpen } from 'react-icons/fi';

type Props = {
  code: string | null;
  title: string | null;
  campusName: string | null;
  className: string | null;
  balanceLabel: string | null;
  completion: number;
  completed: number;
  total: number;
};

export function HeroCard({ code, title, campusName, className: groupName, balanceLabel, completion, completed, total }: Props) {
  return (
    <section className="relative overflow-hidden rounded-box bg-brand text-white">
      <div className="relative z-10 max-w-xl p-6 sm:p-7">
        <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
          <FiBookOpen aria-hidden />
          {code ? `${code} · ${title}` : 'No active level'}
        </p>
        <h2 className="mt-3 text-xl font-bold leading-snug sm:text-2xl">
          {completed} of {total} lessons completed
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80">
          {campusName ? <span className="rounded-full bg-white/15 px-2.5 py-1">{campusName}</span> : null}
          {groupName ? <span className="rounded-full bg-white/15 px-2.5 py-1">{groupName}</span> : <span className="rounded-full bg-white/15 px-2.5 py-1">No class yet</span>}
          {balanceLabel ? <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-brand">{balanceLabel}</span> : null}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/courses" className="btn btn-sm gap-1 rounded-full bg-white text-brand hover:bg-white/90">
            Continue learning <FiArrowRight aria-hidden />
          </Link>
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">{completion}% syllabus</span>
        </div>
      </div>
      <img src="/student-hero.png" alt="" aria-hidden className="pointer-events-none absolute -bottom-1 right-0 hidden h-full w-64 object-cover object-[10px_-30px] sm:block lg:w-80" />
    </section>
  );
}
