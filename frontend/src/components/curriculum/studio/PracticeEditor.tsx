import { useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import type { LessonActivity } from '../../../lib/services';
import { createActivity,updateActivity } from '../../../lib/services';
import { ActivityConfigFields } from '../activity-editors/ActivityConfigFields';
import { ActivityPreviewPane } from '../activity-editors/ActivityPreviewPane';
import { kindFor } from '../activity-editors/activity-kinds';
import { validateConfig } from '../activity-editors/validate-config';
import { StudioDialog } from '../StudioDialog';
import type { ChangePractice } from './practice-draft';
import { backendType,canEditQuestions,draftConfig,practiceDraft,practicePayload } from './practice-draft';

type Props = { lessonId: string; type: string; activity?: LessonActivity; onClose: () => void; onSaved: () => void };
export function PracticeEditor({ lessonId, type, activity, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState(() => practiceDraft(type, activity));
  const [initial] = useState(() => JSON.stringify(practiceDraft(type, activity)));
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const change: ChangePractice = (key, value) => setDraft(previous => ({ ...previous, [key]: value }));
  const close = () => { if (JSON.stringify(draft) === initial || confirm('Discard activity changes?')) onClose(); };
  const editable = canEditQuestions(activity);
  const preview = draftConfig(draft, activity);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    const problem = editable ? validateConfig(draft.type, draft.config) : null;
    if (problem) { setError(problem); return; }
    setBusy(true); setError(null);
    try { const payload = practicePayload(draft, activity); if (activity) await updateActivity(activity.id, payload); else await createActivity(lessonId, payload); onSaved(); onClose(); }
    catch (e) { setError(apiErrorMessage(e, 'Could not save activity.')); } finally { setBusy(false); }
  }
  return <StudioDialog title={activity ? 'Edit activity' : kindFor(draft.type)?.label ?? 'New activity'} onClose={close} busy={busy} wide>
    <form className="space-y-5" onSubmit={event => void save(event)} noValidate>
      <fieldset disabled={busy} className="space-y-5">
        <label className="block text-sm font-medium">Activity name<input autoFocus required maxLength={200} className="input mt-2 w-full" value={draft.title} onChange={event => change('title', event.target.value)} placeholder="e.g. Find the right greeting" /></label>
        {editable ? <ActivityConfigFields type={draft.type} config={draft.config} onChange={config => change('config', config)} />
          : <p className="rounded-box bg-base-200 p-4 text-sm">This activity contains a prepared set of questions. Its questions will stay as they are.</p>}
        <details open={!!activity?.instructions || undefined}><summary className="cursor-pointer text-sm text-muted">Extra instructions <span className="text-xs">optional</span></summary><textarea className="textarea mt-3 w-full" aria-label="Activity instructions" rows={2} maxLength={5000} value={draft.instructions} onChange={event => change('instructions', event.target.value)} /></details>
        <label className="flex items-center gap-3 rounded-box bg-base-200 p-4 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={draft.isPublished} onChange={event => change('isPublished', event.target.checked)} />Available to students when the lesson is published</label>
      </fieldset>
      {editable ? <details className="rounded-box border border-base-300 p-4"><summary className="cursor-pointer text-sm font-medium">Student preview <span className="text-xs font-normal text-muted">· try it, nothing is saved</span></summary>
        <div className="mt-4"><ActivityPreviewPane key={JSON.stringify(preview)} id={activity?.id ?? 'new'} type={backendType(draft.type)} config={preview} /></div></details> : null}
      {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" disabled={busy} onClick={close}>Cancel</button><button className="btn btn-neutral" disabled={busy}>{busy ? 'Saving…' : 'Save activity'}</button></div>
    </form>
  </StudioDialog>;
}
