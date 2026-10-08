import { FiArrowDown, FiArrowUp, FiPlus, FiX } from 'react-icons/fi';
import type { AuthoredQuestion } from './types';

/** Items written in the correct order; students receive them shuffled. */
export function OrderingEditor({ value: q, onChange, locked }: { value: AuthoredQuestion; onChange: (q: AuthoredQuestion) => void; locked: boolean }) {
  const items = Array.isArray(q.options) ? q.options.map(String) : [];
  const save = (next: string[]) => onChange({ ...q, options: next, correctAnswer: next });
  const move = (i: number, d: number) => { const next = [...items]; [next[i], next[i + d]] = [next[i + d], next[i]]; save(next); };
  return (
    <div className="space-y-2">
      <p className="text-xs text-muted">Write the items in the correct order. Students see them shuffled.</p>
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-5 text-center text-xs text-muted">{i + 1}</span>
          <input className="input input-sm min-w-0 flex-1" aria-label={`Item ${i + 1}`} placeholder={`Item ${i + 1}`} value={item} disabled={locked}
            onChange={e => save(items.map((v, n) => n === i ? e.target.value : v))} />
          <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Move item ${i + 1} up`} disabled={locked || i === 0} onClick={() => move(i, -1)}><FiArrowUp aria-hidden /></button>
          <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Move item ${i + 1} down`} disabled={locked || i === items.length - 1} onClick={() => move(i, 1)}><FiArrowDown aria-hidden /></button>
          <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={`Remove item ${i + 1}`} disabled={locked || items.length <= 2} onClick={() => save(items.filter((_, n) => n !== i))}><FiX aria-hidden /></button>
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" disabled={locked || items.length >= 10} onClick={() => save([...items, ''])}><FiPlus aria-hidden />Add item</button>
    </div>
  );
}
