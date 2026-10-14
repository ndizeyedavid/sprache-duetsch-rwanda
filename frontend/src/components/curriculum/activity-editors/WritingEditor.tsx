import type { EditorProps } from './editor-config';
import { str } from './editor-config';

/** WRITING (with optional minimum words and model answer) and DOCUMENT (file upload) tasks. */
export function WritingEditor({ type, config, onChange }: EditorProps) {
  const document = type === 'DOCUMENT';
  return <div className="space-y-4">
    <label className="block text-sm font-medium">Task
      <textarea required rows={3} className="textarea mt-2 w-full" value={str(config.prompt)} placeholder={document ? 'e.g. Upload a photo of your handwritten letter.' : 'e.g. Stell dich vor: Name, Alter, Wohnort.'} onChange={event => onChange({ ...config, prompt: event.target.value })} />
    </label>
    {document ? <label className="block text-sm font-medium">Allowed file types <span className="font-normal text-muted">shown to students</span>
      <input className="input mt-2 w-full" value={str(config.allowedTypes)} onChange={event => onChange({ ...config, allowedTypes: event.target.value })} />
      <span className="mt-1 block text-xs font-normal text-muted">Students can upload PDF, JPG, PNG or WebP up to 10 MB.</span>
    </label> : <>
      <label className="block text-sm font-medium">Minimum words <span className="font-normal text-muted">optional</span>
        <input type="number" min={0} className="input mt-2 w-full" value={str(config.minWords)} onChange={event => onChange({ ...config, minWords: event.target.value })} />
      </label>
      <label className="block text-sm font-medium">Model answer <span className="font-normal text-muted">optional · shown after students submit</span>
        <textarea rows={3} className="textarea mt-2 w-full" value={str(config.modelAnswer)} onChange={event => onChange({ ...config, modelAnswer: event.target.value })} />
      </label>
    </>}
  </div>;
}
