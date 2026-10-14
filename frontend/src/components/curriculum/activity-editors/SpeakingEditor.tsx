import type { EditorProps } from './editor-config';
import { str } from './editor-config';
import { MediaUrlField } from './MediaUrlField';

/** SPEAKING (task + time limit) and PRONUNCIATION (word or phrase); both teacher-graded recordings. */
export function SpeakingEditor({ type, config, onChange }: EditorProps) {
  const pronunciation = type === 'PRONUNCIATION';
  const key = pronunciation ? 'text' : 'prompt';
  return <div className="space-y-4">
    <label className="block text-sm font-medium">{pronunciation ? 'Word or phrase to say' : 'Speaking task'}
      <textarea required rows={pronunciation ? 1 : 3} className="textarea mt-2 w-full" value={str(config[key])} placeholder={pronunciation ? 'e.g. Eichhörnchen' : 'e.g. Introduce yourself: name, age and where you live.'}
        onChange={event => onChange({ ...config, [key]: event.target.value })} />
    </label>
    <MediaUrlField label="Model audio" value={str(config.modelAudioUrl)} onChange={modelAudioUrl => onChange({ ...config, modelAudioUrl })} />
    {pronunciation ? null : <label className="block text-sm font-medium">Recording limit in seconds <span className="font-normal text-muted">optional · default 300</span>
      <input type="number" min={5} max={600} className="input mt-2 w-full" value={str(config.maxSeconds)} onChange={event => onChange({ ...config, maxSeconds: event.target.value })} />
    </label>}
    <p className="text-xs text-muted">Students record in the browser (or upload audio). You grade and listen in Grading.</p>
  </div>;
}
