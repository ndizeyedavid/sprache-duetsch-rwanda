import { FiAward } from 'react-icons/fi';
import type { SheetHistory as Attempt } from '../../lib/services/exam-centre';

const percent = (score: number, total: number) => (total ? Math.round((score / total) * 100) : 0);
const when = (iso: string) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

/** The student's earlier checks of this paper, newest first, so they can see whether they are improving. */
export function SheetHistory({ history }: { history: Attempt[] }) {
  if (!history.length) return null;
  const best = history.reduce((top, row) => (percent(row.score, row.total) > percent(top.score, top.total) ? row : top));
  return (
    <section className="card border border-base-300 bg-base-100 p-4 sm:p-5" aria-label="Your earlier results">
      <h2 className="flex items-center gap-2 font-bold"><FiAward aria-hidden className="text-primary" />Your results</h2>
      <p className="text-sm text-muted">Best {best.score}/{best.total} ({percent(best.score, best.total)}%) · The exam needs 60% to pass.</p>
      <ol className="mt-3 divide-y divide-base-300">
        {history.map((row) => {
          const score = percent(row.score, row.total);
          return (
            <li key={row.id} className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 py-2 text-sm">
              <span className="font-semibold tabular-nums">{when(row.createdAt)}</span>
              <span className="text-muted">{row.sections.map((section) => `${section.name} ${section.score}/${section.total}`).join(' · ')}</span>
              <span className={`font-bold tabular-nums ${score >= 60 ? 'text-ok' : 'text-bad'}`}>{row.score}/{row.total} · {score}%</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
