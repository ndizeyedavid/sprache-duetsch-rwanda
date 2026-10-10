import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import { uploadFile } from '../../lib/services';
export type LevelCompletionDraft = { coursebookUrl: string; coursebookPages: string; minimumAttendance: string; requireHomework: boolean; homeworkPassMark: string };
export function LevelCompletionFields({ value, onChange, onBusyChange }: { value: LevelCompletionDraft; onChange: (value: Partial<LevelCompletionDraft>) => void; onBusyChange: (busy: boolean) => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function upload(file?: File) {
    if (!file) return;
    setBusy(true); onBusyChange(true); setError(null);
    try { const result = await uploadFile(file); onChange({ coursebookUrl: result.url }); }
    catch (cause) { setError(apiErrorMessage(cause, 'Could not upload coursebook.')); }
    finally { setBusy(false); onBusyChange(false); }
  }
  return <fieldset className="space-y-3 rounded-box border border-base-300 p-3">
    <legend className="px-1 text-sm font-medium">Coursebook and certificate rules</legend>
    <label className="block text-xs">Level coursebook (PDF)<input type="file" accept="application/pdf" disabled={busy} className="file-input file-input-sm mt-1 w-full" onChange={event => void upload(event.target.files?.[0])} /></label>
    {value.coursebookUrl ? <p className="break-all text-xs">Uploaded: {value.coursebookUrl}<button type="button" className="btn btn-xs ml-2" onClick={() => onChange({ ...value, coursebookUrl: '' })}>Clear</button></p> : null}
    <label className="block text-xs">Coursebook page count<input type="number" min="1" value={value.coursebookPages} onChange={event => onChange({ ...value, coursebookPages: event.target.value })} className="input input-sm mt-1 w-full" /></label>
    <label className="block text-xs">Minimum attendance (%) — 0 disables this rule<input type="number" min="0" max="100" value={value.minimumAttendance} onChange={event => onChange({ ...value, minimumAttendance: event.target.value })} className="input input-sm mt-1 w-full" /></label>
    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="checkbox checkbox-sm" checked={value.requireHomework} onChange={event => onChange({ ...value, requireHomework: event.target.checked })} />Require all assigned homework to pass</label>
    <label className="block text-xs">Homework pass mark (%)<input type="number" min="0" max="100" value={value.homeworkPassMark} onChange={event => onChange({ ...value, homeworkPassMark: event.target.value })} className="input input-sm mt-1 w-full" /></label>
    <p className="text-xs text-base-content/60">Certificates always require all published lessons and every published final exam. Payment clearance is separate.</p>
    {busy ? <p role="status" className="text-xs">Uploading coursebook…</p> : null}{error ? <p role="alert" className="text-xs text-error">{error}</p> : null}
  </fieldset>;
}
