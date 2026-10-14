import type { EditorProps } from './editor-config';
import { str } from './editor-config';

export function TrueFalseEditor({ config, onChange }: EditorProps) {
  return <div className="space-y-4">
    <label className="block text-sm font-medium">Statement
      <textarea required rows={2} className="textarea mt-2 w-full" value={str(config.statement)} placeholder="e.g. Berlin ist die Hauptstadt von Deutschland." onChange={event => onChange({ ...config, statement: event.target.value })} />
    </label>
    <fieldset><legend className="mb-2 text-sm font-medium">Correct answer</legend>
      <div className="grid grid-cols-2 gap-3">{[true, false].map(value => <button key={String(value)} type="button" aria-pressed={config.correct === value}
        className={`btn ${config.correct === value ? 'btn-neutral' : 'border-0 bg-base-200'}`} onClick={() => onChange({ ...config, correct: value })}>{value ? 'True' : 'False'}</button>)}</div>
    </fieldset>
  </div>;
}
