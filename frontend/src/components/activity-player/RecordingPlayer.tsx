import { useState } from 'react';
import { AudioRecorder } from '../media/AudioRecorder';
import { AuthenticatedMedia } from '../ui/AuthenticatedMedia';
import { asFileResponse,text } from './config-readers';
import type { PlayerProps } from './types';
import { useActivityUpload } from './useActivityUpload';

const ACCEPT = 'audio/webm,audio/ogg,audio/mp4,audio/mpeg,audio/wav';

/** SPEAKING / PRONUNCIATION: record (or upload) audio in the browser; the response references the upload. */
export function RecordingPlayer({ activityId, type, config, value, onChange, disabled }: PlayerProps) {
  const { upload, busy, error } = useActivityUpload(activityId);
  const [recording, setRecording] = useState(false);
  const file = asFileResponse(value);
  const say = text(type === 'PRONUNCIATION' ? config.text ?? config.prompt : config.prompt);
  const model = text(config.modelAudioUrl);
  const maxSeconds = Number(config.maxSeconds) > 0 ? Math.min(Number(config.maxSeconds), 600) : 300;
  async function attach(selected: File) { const uploaded = await upload(selected); if (uploaded) onChange(uploaded); }
  return <div className="space-y-4">
    {say ? <div className="rounded-box border border-base-300 bg-base-100 p-4">
      <p className="text-xs font-semibold text-muted">{type === 'PRONUNCIATION' ? 'Say this aloud' : 'Your speaking task'}</p>
      <p className={`mt-1 whitespace-pre-wrap ${type === 'PRONUNCIATION' ? 'text-2xl font-bold' : 'text-sm'}`} lang={type === 'PRONUNCIATION' ? 'de' : undefined}>{say}</p>
    </div> : null}
    {model ? <div><p className="mb-1 text-xs font-semibold">Listen to the model first</p><AuthenticatedMedia url={model} kind="audio" title="model audio" className="w-full" /></div> : null}
    <AudioRecorder disabled={disabled || busy} onRecordingChange={setRecording} onFile={attach} maxSeconds={maxSeconds}
      startLabel={file ? 'Record again' : 'Start recording'} stopLabel="Stop recording"
      hint={`Find a quiet spot and speak clearly. Recording stops after ${maxSeconds >= 60 ? `${Math.round(maxSeconds / 60)} min` : `${maxSeconds} s`}.`} />
    {busy ? <p role="status" className="text-xs text-muted">Uploading your recording…</p> : null}
    {file && !recording ? <div><p className="mb-1 text-xs font-semibold">Your recording</p><AuthenticatedMedia key={file.fileUrl} url={file.fileUrl} kind="audio" title="your recording" className="w-full" /></div> : null}
    <label className="block text-xs text-muted">No microphone? Upload an audio file instead.
      <input type="file" accept={ACCEPT} disabled={disabled || busy || recording} className="file-input file-input-sm mt-1 w-full" aria-label="Upload an audio file"
        onChange={event => { const selected = event.target.files?.[0]; if (selected) void attach(selected); event.target.value = ''; }} />
    </label>
    {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
  </div>;
}
