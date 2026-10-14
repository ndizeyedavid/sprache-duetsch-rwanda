import { useState } from 'react';
import { FiUploadCloud } from 'react-icons/fi';
import { apiErrorMessage } from '../../../lib/api';
import { uploadFile } from '../../../lib/services';
import { AuthenticatedMedia } from '../../ui/AuthenticatedMedia';

type Props = { label: string; value: string; onChange: (url: string) => void; required?: boolean };

/** Audio link field with an upload button; uploads go through the staff upload endpoint. */
export function MediaUrlField({ label, value, onChange, required }: Props) {
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  async function upload(file: File) {
    setBusy(true); setError('');
    try { onChange((await uploadFile(file)).url); } catch (e) { setError(apiErrorMessage(e, 'Could not upload the audio.')); } finally { setBusy(false); }
  }
  return <div className="space-y-1">
    <label className="block text-sm font-medium">{label}{required ? null : <span className="font-normal text-muted"> optional</span>}
      <input className="input mt-2 w-full" value={value} required={required} placeholder="Upload a file or paste a link" onChange={event => onChange(event.target.value)} />
    </label>
    <label className="btn btn-sm btn-ghost gap-2">
      {busy ? <span className="loading loading-spinner loading-xs" /> : <FiUploadCloud aria-hidden />}{busy ? 'Uploading…' : 'Upload audio'}
      <input type="file" accept="audio/*" className="hidden" disabled={busy} onChange={event => { const file = event.target.files?.[0]; if (file) void upload(file); event.target.value = ''; }} />
    </label>
    {value ? <AuthenticatedMedia key={value} url={value} kind="audio" title="audio" className="w-full" /> : null}
    {error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
  </div>;
}
