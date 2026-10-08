import { FiPlus, FiX } from 'react-icons/fi';
import type { AuthoredQuestion } from './types';

type Pair = [string, string];

/** Rows of "left → right". Stored as options {left, right} plus an answer map the grader compares. */
export function MatchingEditor({ value: q, onChange, locked }: { value: AuthoredQuestion; onChange: (q: AuthoredQuestion) => void; locked: boolean }) {
  const left = ((q.options as { left?: unknown[] } | null)?.left ?? []).map(String);
  const answer = q.correctAnswer && typeof q.correctAnswer === 'object' ? q.correctAnswer as Record<string, string> : {};
  const pairs: Pair[] = left.map(l => [l, answer[l] ?? '']);
  function save(next: Pair[]) {
    onChange({ ...q, options: { left: next.map(p => p[0]), right: [...new Set(next.map(p => p[1]))].sort((a, b) => a.localeCompare(b)) },
      correctAnswer: Object.fromEntries(next.filter(p => p[0]).map(p => [p[0], p[1]])) });
  }
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">Write each pair. Students see the right side mixed up.</p>
      {pairs.map(([l, r], i) => (
        <div key={i} className="flex items-center gap-2">
          <input className="input input-sm min-w-0 flex-1" aria-label={`Pair ${i + 1} left`} placeholder="e.g. eins" value={l} disabled={locked}
            onChange={e => save(pairs.map((p, n) => n === i ? [e.target.value, p[1]] : p))} />
          <span className="text-muted">→</span>
          <input className="input input-sm min-w-0 flex-1" aria-label={`Pair ${i + 1} right`} placeholder="e.g. 1" value={r} disabled={locked}
            onChange={e => save(pairs.map((p, n) => n === i ? [p[0], e.target.value] : p))} />
          <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label={`Remove pair ${i + 1}`} disabled={locked || pairs.length <= 2}
            onClick={() => save(pairs.filter((_, n) => n !== i))}><FiX aria-hidden /></button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" disabled={locked || pairs.length >= 8} onClick={() => save([...pairs, ['', '']])}><FiPlus aria-hidden />Add pair</button>
    </div>
  );
}
