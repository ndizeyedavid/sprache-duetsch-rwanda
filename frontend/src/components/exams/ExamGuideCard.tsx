import { FiCheckCircle,FiInfo } from 'react-icons/fi';
import type { ExamGuide } from './exam-guides';

/** The level's Goethe exam at a glance: parts, timing, scoring and what to watch out for. */
export function ExamGuideCard({ guide }: { guide: ExamGuide }) {
  return (
    <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-label={`How ${guide.exam} works`}>
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted"><FiInfo aria-hidden />How the exam works</p>
      <h2 className="mt-1 text-lg font-bold" lang="de">{guide.exam}</h2>
      <p className="mt-1 text-sm text-muted">{guide.summary}</p>
      <ul className="mt-4 grid gap-2 md:grid-cols-2">
        {guide.parts.map((part) => (
          <li key={part.name} className="rounded-field border border-base-300 p-3">
            <span className="flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-sm font-semibold" lang="de">{part.name}</span>
              <span className="text-xs text-muted">{part.time}</span>
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted">{part.what}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 rounded-field bg-base-200 p-3 text-sm">{guide.scoring}</p>
      <h3 className="mt-4 text-sm font-semibold">Tips</h3>
      <ul className="mt-2 space-y-1.5">
        {guide.tips.map((tip) => <li key={tip} className="flex items-start gap-2 text-sm leading-6"><FiCheckCircle aria-hidden className="mt-1 shrink-0 text-ok" />{tip}</li>)}
      </ul>
    </section>
  );
}
