import { format,isToday,isTomorrow } from 'date-fns';
import type { ClassInsights } from './class-insights';

const when = (iso: string) => {
  const date = new Date(iso);
  const day = isToday(date) ? 'Today' : isTomorrow(date) ? 'Tomorrow' : format(date, 'EEE d MMM');
  return { day, time: format(date, 'HH:mm') };
};

/** Three quick numbers: learners, work waiting, and when the class meets next. */
export function ClassCardStats({ enrolled, insights }: { enrolled: number; insights: ClassInsights | null }) {
  const next = insights?.nextSession ? when(insights.nextSession.startAt) : null;
  const review = insights?.toReview ?? 0;
  return (
    <dl className="grid grid-cols-3 gap-2">
      <div className="rounded-box bg-base-200 px-3 py-2.5">
        <dt className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">Learners</dt>
        <dd className="mt-0.5 text-xl font-semibold">{enrolled}</dd>
      </div>
      <div className={`rounded-box px-3 py-2.5 ${review ? 'bg-brand-soft text-brand-soft-ink' : 'bg-base-200'}`}>
        <dt className="text-[0.625rem] font-semibold uppercase tracking-wider opacity-80">To review</dt>
        <dd className="mt-0.5 text-xl font-semibold">{insights ? review : '—'}</dd>
      </div>
      <div className="min-w-0 rounded-box bg-base-200 px-3 py-2.5" title={insights?.nextSession?.title}>
        <dt className="text-[0.625rem] font-semibold uppercase tracking-wider text-muted">Next class</dt>
        <dd className="mt-0.5 truncate text-sm font-semibold leading-7">{next ? `${next.day} · ${next.time}` : insights ? 'None set' : '—'}</dd>
      </div>
    </dl>
  );
}
