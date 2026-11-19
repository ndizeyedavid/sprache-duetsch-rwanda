import { useState } from 'react';
import { FiMusic,FiPlus,FiTrash2 } from 'react-icons/fi';
import { apiErrorMessage } from '../../lib/api';
import type { PaperAudio } from '../../lib/services/exam-centre';
import { uploadFile } from '../../lib/services/upload-file';

type Props = { value: PaperAudio[]; onChange: (next: PaperAudio[]) => void; onBusy: (busy: boolean) => void };

/** The paper's listening recordings: upload MP3s (up to 25 MB each), name them ("Hören, Teil 1"), remove them. */
export function PaperAudioEditor({ value, onChange, onBusy }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function add(file: File | undefined) {
    if (!file) return;
    setUploading(true); onBusy(true); setError(null);
    try {
      const result = await uploadFile(file);
      onChange([...value, { title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '), url: result.url }]);
    } catch (e) { setError(apiErrorMessage(e, 'Upload failed. Choose an MP3 up to 25 MB.')); }
    finally { setUploading(false); onBusy(false); }
  }
  return (
    <div className="space-y-2">
      <span className="block text-xs font-medium">Listening recordings (optional)</span>
      {value.map((track, index) => (
        <div key={`${track.url}-${index}`} className="flex items-center gap-2">
          <FiMusic aria-hidden className="shrink-0 text-muted" />
          <input aria-label={`Title of recording ${index + 1}`} value={track.title} maxLength={80} className="input input-sm min-w-0 flex-1 rounded-field border-line bg-base-200"
            onChange={(event) => onChange(value.map((row, at) => (at === index ? { ...row, title: event.currentTarget.value } : row)))} />
          <button type="button" className="btn btn-ghost btn-sm btn-circle" aria-label={`Remove ${track.title}`} onClick={() => onChange(value.filter((_, at) => at !== index))}><FiTrash2 aria-hidden /></button>
        </div>
      ))}
      <label className={`btn btn-sm gap-2 rounded-full border-line bg-base-200 ${uploading ? 'btn-disabled' : ''}`}>
        {uploading ? <span className="loading loading-spinner loading-xs" /> : <FiPlus aria-hidden />}Add a recording
        <input type="file" accept="audio/mpeg,audio/mp3,audio/ogg,audio/wav,audio/webm" className="hidden" disabled={uploading}
          onChange={(event) => { const file = event.currentTarget.files?.[0]; event.currentTarget.value = ''; void add(file); }} />
      </label>
      <span className="block text-xs text-muted">Students play these in the app, in this order. Name each one after its part, e.g. “Hören, Teil 1”.</span>
      {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
    </div>
  );
}
