import { FiPlus } from 'react-icons/fi';
import type { EditorProps } from './editor-config';
import { index,moveItem,str,strings } from './editor-config';
import { RowButtons } from './RowButtons';

/** MCQ (one correct) and MULTIPLE_SELECT (several correct). */
export function ChoiceEditor({ type, config, onChange }: EditorProps) {
  const options = strings(config.options, ['', '']);
  const multiple = type === 'MULTIPLE_SELECT';
  const correct = multiple ? (Array.isArray(config.correctIndices) ? config.correctIndices.map(Number) : []) : [index(config.correctIndex)];
  const setOptions = (next: string[], nextCorrect = correct) => onChange({ ...config, options: next, ...(multiple ? { correctIndices: nextCorrect } : { correctIndex: nextCorrect[0] ?? 0 }) });
  const toggle = (i: number) => multiple ? setOptions(options, correct.includes(i) ? correct.filter(v => v !== i) : [...correct, i]) : setOptions(options, [i]);
  function move(from: number, to: number) {
    const remap = (v: number) => v === from ? to : from < to && v > from && v <= to ? v - 1 : from > to && v >= to && v < from ? v + 1 : v;
    setOptions(moveItem(options, from, to), correct.map(remap));
  }
  const remove = (i: number) => setOptions(options.filter((_, n) => n !== i), correct.filter(v => v !== i).map(v => v > i ? v - 1 : v));
  return <div className="space-y-4">
    <label className="block text-sm font-medium">Question
      <textarea required rows={2} className="textarea mt-2 w-full" value={str(config.question)} placeholder="e.g. What does “Guten Morgen” mean?" onChange={event => onChange({ ...config, question: event.target.value })} />
    </label>
    <fieldset className="space-y-2">
      <legend className="mb-2 text-sm font-medium">Answers <span className="font-normal text-muted">· {multiple ? 'tick every correct one' : 'select the correct one'}</span></legend>
      {options.map((option, i) => <div key={i} className={`flex items-center gap-2 rounded-field p-2 ${correct.includes(i) ? 'bg-success text-success-content' : 'bg-base-200'}`}>
        <input type={multiple ? 'checkbox' : 'radio'} name="choice-correct" className={multiple ? 'checkbox checkbox-sm' : 'radio radio-sm'} aria-label={`Answer ${i + 1} is correct`} checked={correct.includes(i)} onChange={() => toggle(i)} />
        <input required className="input input-sm min-w-0 grow border-0" aria-label={`Answer ${i + 1}`} placeholder={`Answer ${i + 1}`} value={option} onChange={event => setOptions(options.map((v, n) => n === i ? event.target.value : v))} />
        <RowButtons label={`answer ${i + 1}`} index={i} count={options.length} min={2} onMove={to => move(i, to)} onRemove={() => remove(i)} />
      </div>)}
      {options.length < 8 ? <button type="button" className="btn btn-sm btn-ghost" onClick={() => setOptions([...options, ''])}><FiPlus aria-hidden />Add answer</button> : null}
    </fieldset>
  </div>;
}
