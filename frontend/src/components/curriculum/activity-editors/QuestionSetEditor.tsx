import type { EditorProps } from './editor-config';
import { questionRows,str } from './editor-config';
import { MediaUrlField } from './MediaUrlField';
import { QuestionListEditor } from './QuestionListEditor';

/** LISTENING (audio + optional transcript) and READING (passage), each with choice questions. */
export function QuestionSetEditor({ type, config, onChange }: EditorProps) {
  return <div className="space-y-4">
    {type === 'LISTENING' ? <>
      <MediaUrlField label="Listening audio" required value={str(config.audioUrl)} onChange={audioUrl => onChange({ ...config, audioUrl })} />
      <label className="block text-sm font-medium">Transcript <span className="font-normal text-muted">optional · shown after students submit</span>
        <textarea rows={3} className="textarea mt-2 w-full" value={str(config.transcript)} onChange={event => onChange({ ...config, transcript: event.target.value })} />
      </label>
    </> : <label className="block text-sm font-medium">Reading passage
      <textarea required rows={6} className="textarea mt-2 w-full" value={str(config.passage)} placeholder="Paste or write the text students read." onChange={event => onChange({ ...config, passage: event.target.value })} />
    </label>}
    <QuestionListEditor questions={questionRows(config.questions)} onChange={questions => onChange({ ...config, questions })} />
  </div>;
}
