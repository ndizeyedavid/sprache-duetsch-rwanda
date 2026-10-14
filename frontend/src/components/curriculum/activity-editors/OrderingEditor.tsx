import { FiPlus } from 'react-icons/fi';
import type { EditorProps } from './editor-config';
import { moveItem,strings } from './editor-config';
import { RowButtons } from './RowButtons';

/** Items in the correct order; students receive them shuffled. */
export function OrderingEditor({ config, onChange }: EditorProps) {
  const items = strings(config.items, ['', '']);
  const set = (next: string[]) => onChange({ ...config, items: next });
  return <div className="space-y-2">
    <p className="text-xs text-muted">Enter the items in the <strong>correct</strong> order — e.g. the words of a sentence. Students see them shuffled.</p>
    <ol className="space-y-2">{items.map((item, i) => <li key={i} className="flex items-center gap-2">
      <span className="w-5 text-xs font-bold text-muted">{i + 1}</span>
      <input required className="input input-sm min-w-0 flex-1" aria-label={`Item ${i + 1}`} value={item} onChange={event => set(items.map((v, n) => n === i ? event.target.value : v))} />
      <RowButtons label={`item ${i + 1}`} index={i} count={items.length} min={2} onMove={to => set(moveItem(items, i, to))} onRemove={() => set(items.filter((_, n) => n !== i))} />
    </li>)}</ol>
    <button type="button" className="btn btn-sm btn-ghost" onClick={() => set([...items, ''])}><FiPlus aria-hidden />Add item</button>
  </div>;
}
