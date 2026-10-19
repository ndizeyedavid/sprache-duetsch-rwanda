import { FiFileText } from 'react-icons/fi';
import { openMaterial } from '../student/materialFiles';
import { asFileResponse,text } from './config-readers';
import type { PlayerProps } from './types';
import { useActivityUpload } from './useActivityUpload';

const ACCEPT = 'application/pdf,image/png,image/jpeg,image/webp';

/** Document submission (WRITING with `isDocumentSubmission`): upload a PDF or photo, add an optional note. */
export function FileSubmissionPlayer({ activityId, config, value, onChange, disabled }: PlayerProps) {
  const { upload, busy, error } = useActivityUpload(activityId);
  const file = asFileResponse(value);
  const prompt = text(config.prompt);
  async function choose(selected: File) {
    const uploaded = await upload(selected);
    if (uploaded) onChange({ ...uploaded, ...(file?.text ? { text: file.text } : {}) });
  }
  return <div className="space-y-3">
    {prompt ? <p className="rounded-box border border-base-300 bg-base-200 p-3 text-sm whitespace-pre-wrap">{prompt}</p> : null}
    <label className="block rounded-box border border-dashed border-base-300 p-4">
      <span className="mb-2 block text-xs font-semibold">{busy ? 'Uploading…' : file ? 'Replace your file' : 'Upload your work'}</span>
      <input type="file" accept={ACCEPT} disabled={disabled || busy} className="file-input file-input-sm w-full" aria-label="Upload your work"
        onChange={event => { const selected = event.target.files?.[0]; if (selected) void choose(selected); event.target.value = ''; }} />
      <span className="mt-2 block text-[0.6875rem] text-muted">PDF or a clear photo (JPG, PNG, WebP) · up to 10 MB</span>
    </label>
    {file ? <button type="button" className="btn btn-sm gap-2 rounded-full" onClick={() => void openMaterial(file.fileUrl, 'Your submission').catch(() => {})}><FiFileText aria-hidden />Open uploaded file</button> : null}
    {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
    <label className="block text-xs font-medium">Note for your teacher <span className="font-normal text-muted">optional</span>
      <textarea rows={2} maxLength={5000} disabled={disabled || !file} value={file?.text ?? ''} className="textarea mt-1 w-full text-sm"
        onChange={event => file && onChange({ ...file, text: event.target.value })} />
    </label>
  </div>;
}
