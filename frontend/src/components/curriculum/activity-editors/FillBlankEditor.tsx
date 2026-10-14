import { FiPlus } from 'react-icons/fi';
import type { EditorProps } from './editor-config';
import { moveItem,rows,str } from './editor-config';
import { RowButtons } from './RowButtons';

/** Sentences with a ___ blank; several accepted answers are separated by `|`. */
export function FillBlankEditor({ config, onChange }: EditorProps) {
  const sentences = rows(config.sentences).map(row => ({ text: str(row.text), answer: str(row.answer) }));
  const set = (next: typeof sentences) => onChange({ ...config, sentences: next });
  const edit = (i: number, key: 'text' | 'answer', value: string) => set(sentences.map((row, n) => n === i ? { ...row, [key]: value } : row));
  return <div className="space-y-3">
    <p className="text-xs text-muted">Type ___ where the missing word goes. Accept more than one answer with | (e.g. komme | stamme).</p>
    {sentences.map((sentence, i) => <div key={i} className="space-y-2 rounded-box bg-base-200 p-3">
      <div className="flex items-center justify-between"><span className="text-xs font-medium">Sentence {i + 1}</span>
        <RowButtons label={`sentence ${i + 1}`} index={i} count={sentences.length} onMove={to => set(moveItem(sentences, i, to))} onRemove={() => set(sentences.filter((_, n) => n !== i))} /></div>
      <input required className="input input-sm w-full" aria-label={`Sentence ${i + 1}`} placeholder="Ich ___ aus Ruanda." value={sentence.text} onChange={event => edit(i, 'text', event.target.value)} />
      <input required className="input input-sm w-full" aria-label={`Accepted answers for sentence ${i + 1}`} placeholder="komme | stamme" value={sentence.answer} onChange={event => edit(i, 'answer', event.target.value)} />
    </div>)}
    <button type="button" className="btn btn-sm btn-ghost" onClick={() => set([...sentences, { text: '', answer: '' }])}><FiPlus aria-hidden />Add sentence</button>
  </div>;
}
