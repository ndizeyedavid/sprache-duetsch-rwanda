import type { FormEvent } from 'react';
import { useState } from 'react';
import { apiErrorMessage } from '../../lib/api';
import type { LevelItem } from '../../lib/services';
import { createExamPaper,updateExamPaper } from '../../lib/services/exam-centre';
import type { ExamPaperInput,StaffExamPaper } from '../../lib/services/exam-centre';
import { uploadFile } from '../../lib/services/upload-file';
import { PaperAudioEditor } from './PaperAudioEditor';

const field = 'input w-full rounded-field border-line bg-base-200';
const KEY_HINT = 'One line per part: title | choices | answers\nLesen Teil 1 | a b c | b b c b a\nHören Teil 4 | Ja Nein | Ja Nein Ja Ja Nein';

const blankPaper = (levelId = ''): ExamPaperInput => ({
  levelId, title: '', description: '', provider: 'Goethe-Institut', edition: '', fileUrl: null, fileName: null, sizeBytes: null,
  sourceUrl: '', answerKey: '', order: 0, isPublished: true, audio: [],
});

type Props = { paper: StaffExamPaper | null; levels: LevelItem[]; onSaved: () => void; onCancel: () => void };

/** Add or edit a past paper: the PDF, its listening recordings, the official page and, optionally, the answer key. */
export function ExamPaperForm({ paper, levels, onSaved, onCancel }: Props) {
  const [draft, setDraft] = useState<ExamPaperInput>(() => paper ? { ...paper } : blankPaper(levels[0]?.id));
  const [uploading, setUploading] = useState(false);
  const [audioBusy, setAudioBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (patch: Partial<ExamPaperInput>) => setDraft((previous) => ({ ...previous, ...patch }));

  async function upload(file: File | undefined) {
    if (!file) return;
    setUploading(true); setError(null);
    try { const result = await uploadFile(file); set({ fileUrl: result.url, fileName: file.name, sizeBytes: result.sizeBytes }); }
    catch (e) { setError(apiErrorMessage(e, 'Upload failed. Choose a PDF up to 25 MB.')); }
    finally { setUploading(false); }
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    setSaving(true); setError(null);
    try { await (paper ? updateExamPaper(paper.id, draft) : createExamPaper(draft)); onSaved(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not save the paper.')); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={(event) => void save(event)} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Course level</span>
          <select required value={draft.levelId} onChange={(event) => set({ levelId: event.currentTarget.value })} className="select w-full rounded-field border-line bg-base-200">
            {levels.map((level) => <option key={level.id} value={level.id}>{level.code} · {level.title}</option>)}
          </select></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Title</span>
          <input required minLength={3} value={draft.title} onChange={(event) => set({ title: event.currentTarget.value })} placeholder="Goethe-Zertifikat B1 · Modellsatz" className={field} /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Source</span>
          <input required value={draft.provider} onChange={(event) => set({ provider: event.currentTarget.value })} className={field} /></label>
        <label className="block"><span className="mb-1.5 block text-xs font-medium">Edition or year (optional)</span>
          <input value={draft.edition ?? ''} onChange={(event) => set({ edition: event.currentTarget.value })} placeholder="2024" className={field} /></label>
      </div>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">What students should know (optional)</span>
        <textarea value={draft.description ?? ''} onChange={(event) => set({ description: event.currentTarget.value })} rows={2} className="textarea w-full rounded-field border-line bg-base-200" /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">PDF</span>
        <input type="file" accept="application/pdf" onChange={(event) => void upload(event.currentTarget.files?.[0])} className="file-input w-full rounded-field" disabled={uploading} />
        <span className="mt-1 block text-xs text-muted">{uploading ? 'Uploading…' : draft.fileUrl ? `Uploaded: ${draft.fileName ?? draft.fileUrl}` : 'No file yet. A link alone also works.'}</span></label>
      <PaperAudioEditor value={draft.audio} onChange={(audio) => set({ audio })} onBusy={setAudioBusy} />
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Official page (https://, optional)</span>
        <input type="url" value={draft.sourceUrl ?? ''} onChange={(event) => set({ sourceUrl: event.currentTarget.value })} placeholder="https://www.goethe.de/…" className={field} /></label>
      <label className="block"><span className="mb-1.5 block text-xs font-medium">Answer key for the online answer sheet (optional)</span>
        <textarea value={draft.answerKey} onChange={(event) => set({ answerKey: event.currentTarget.value })} rows={6} placeholder={KEY_HINT} className="textarea w-full rounded-field border-line bg-base-200 font-mono text-xs" /></label>
      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={draft.isPublished} onChange={(event) => set({ isPublished: event.currentTarget.checked })} className="checkbox checkbox-sm" />Visible to students</label>
        <label className="flex items-center gap-2 text-sm">Order<input type="number" min={0} max={999} value={draft.order} onChange={(event) => set({ order: Number(event.currentTarget.value) || 0 })} className="input input-sm w-20 rounded-field border-line bg-base-200" /></label>
      </div>
      {error ? <p role="alert" className="alert alert-error text-sm">{error}</p> : null}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="btn btn-sm rounded-full">Cancel</button>
        <button type="submit" disabled={saving || uploading || audioBusy} className="btn btn-primary btn-sm rounded-full">{saving ? <span className="loading loading-spinner loading-xs" /> : null}Save paper</button>
      </div>
    </form>
  );
}
