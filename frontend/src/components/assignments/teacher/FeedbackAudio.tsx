import { useState } from 'react';
import { FiX } from 'react-icons/fi';
import { apiErrorMessage } from '../../../lib/api';
import { uploadFeedbackAudio } from '../../../lib/homework';
import { AudioRecorder } from '../../media/AudioRecorder';
import { AudioPlayback } from '../homework/AudioPlayback';
import type { Attachment } from '../homework/types';

type Props = { assignmentId: string; value: Attachment | null; onChange: (file: Attachment | null) => void; disabled: boolean; onRecordingChange: (recording: boolean) => void };

/** Spoken feedback: record in the browser or upload a clip. It is sent with the grade or revision request. */
export function FeedbackAudio({ assignmentId, value, onChange, disabled, onRecordingChange }: Props) {
  const [uploading, setUploading] = useState(false), [error, setError] = useState('');
  async function attach(file: File) {
    setError('');
    if (file.size > 10 * 1024 * 1024) { setError('Choose an audio file smaller than 10 MB.'); return; }
    setUploading(true);
    try { onChange(await uploadFeedbackAudio(assignmentId, file)); }
    catch (e) { setError(apiErrorMessage(e, 'Could not upload the audio. Try again.')); }
    finally { setUploading(false); }
  }
  return (
    <section className="space-y-2" aria-label="Audio feedback">
      <h3 className="text-xs font-semibold">Audio feedback <span className="font-normal text-muted">· optional</span></h3>
      {value ? (
        <div className="rounded-field border border-base-300 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="truncate text-xs">{value.originalName}</span>
            <button type="button" className="btn btn-ghost btn-xs" disabled={disabled} onClick={() => onChange(null)}><FiX aria-hidden />Remove</button>
          </div>
          <AudioPlayback assignmentId={assignmentId} file={value} />
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2">
          <AudioRecorder onFile={attach} disabled={disabled || uploading} onRecordingChange={onRecordingChange} maxSeconds={300}
            hint="Speak to the student about their work (up to 5 minutes). They can replay it." startLabel="Record feedback" stopLabel="Stop & attach" />
          <label className="block rounded-box border border-dashed border-base-300 p-4">
            <span className="mb-2 block text-xs text-muted">{uploading ? 'Uploading…' : 'Or upload an audio file'}</span>
            <input type="file" accept="audio/*" aria-label="Upload audio feedback" className="file-input file-input-sm w-full" disabled={disabled || uploading}
              onChange={e => { const f = e.target.files?.[0]; if (f) void attach(f); e.target.value = ''; }} />
          </label>
        </div>
      )}
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
    </section>
  );
}
