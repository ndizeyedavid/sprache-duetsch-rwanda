import { FiPlus } from 'react-icons/fi';
import type { EditorProps } from './editor-config';
import { moveItem,rows,str } from './editor-config';
import { RowButtons } from './RowButtons';

/** Pairs in their correct match; students see the right-hand side shuffled. */
export function MatchingEditor({ config, onChange }: EditorProps) {
  const pairs = rows(config.pairs).map(row => ({ left: str(row.left), right: str(row.right) }));
  const set = (next: typeof pairs) => onChange({ ...config, pairs: next });
  return <div className="space-y-2">
    <p className="text-xs text-muted">Write each word with its correct match. Students see the matches shuffled.</p>
    {pairs.map((pair, i) => <div key={i} className="flex items-center gap-2">
      <input required className="input input-sm min-w-0 flex-1" aria-label={`Pair ${i + 1} word`} placeholder="Word" value={pair.left} onChange={event => set(pairs.map((p, n) => n === i ? { ...p, left: event.target.value } : p))} />
      <span className="text-muted" aria-hidden>↔</span>
      <input required className="input input-sm min-w-0 flex-1" aria-label={`Pair ${i + 1} match`} placeholder="Meaning" value={pair.right} onChange={event => set(pairs.map((p, n) => n === i ? { ...p, right: event.target.value } : p))} />
      <RowButtons label={`pair ${i + 1}`} index={i} count={pairs.length} min={2} onMove={to => set(moveItem(pairs, i, to))} onRemove={() => set(pairs.filter((_, n) => n !== i))} />
    </div>)}
    <button type="button" className="btn btn-sm btn-ghost" onClick={() => set([...pairs, { left: '', right: '' }])}><FiPlus aria-hidden />Add pair</button>
  </div>;
}
