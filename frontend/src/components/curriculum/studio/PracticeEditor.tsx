import { useState } from 'react';
import { apiErrorMessage } from '../../../lib/api';
import type { LessonActivity } from '../../../lib/services';
import { createActivity,updateActivity } from '../../../lib/services';
import { StudioDialog } from '../StudioDialog';
import { PracticeQuestionFields } from './PracticeQuestionFields';
import type { ChangePractice } from './practice-draft';
import { canEditQuestions,practiceDraft,practiceKinds,practicePayload } from './practice-draft';

type Props = { lessonId: string; type: string; activity?: LessonActivity; onClose: () => void; onSaved: () => void };
export function PracticeEditor({ lessonId, type, activity, onClose, onSaved }: Props) {
  const [draft, setDraft] = useState(() => practiceDraft(type, activity));
  const [initial] = useState(() => JSON.stringify(practiceDraft(type, activity)));
  const [busy, setBusy] = useState(false), [error, setError] = useState<string | null>(null);
  const change: ChangePractice = (key,value) => setDraft(previous=>({...previous,[key]:value}));
  const close = () => { if (JSON.stringify(draft)===initial || confirm('Discard activity changes?')) onClose(); };
  const kind = practiceKinds.find(item=>item.type===draft.type);
  return <StudioDialog title={activity?'Edit activity':kind?.label??'New activity'} onClose={close} busy={busy}>
    <form className="space-y-5" onSubmit={async event=>{
      event.preventDefault();setBusy(true);setError(null);
      try { const payload=practicePayload(draft,activity);if(activity)await updateActivity(activity.id,payload);else await createActivity(lessonId,payload);onSaved();onClose(); }
      catch(e){setError(apiErrorMessage(e,'Could not save activity.'));}finally{setBusy(false);}
    }}>
      <fieldset disabled={busy} className="space-y-5">
        <label className="block text-sm font-medium">Activity name<input autoFocus required maxLength={200} className="input mt-2 w-full" value={draft.title} onChange={event=>change('title',event.target.value)} placeholder="e.g. Find the right greeting"/></label>
        {canEditQuestions(activity)?<PracticeQuestionFields draft={draft} change={change}/>:<p className="rounded-box bg-base-200 p-4 text-sm">This activity contains a prepared set of questions. Its questions will stay as they are.</p>}
        <details open={!!activity?.instructions || undefined}><summary className="cursor-pointer text-sm text-base-content/60">Extra instructions <span className="text-xs">optional</span></summary><textarea className="textarea mt-3 w-full" aria-label="Activity instructions" rows={2} maxLength={5000} value={draft.instructions} onChange={event=>change('instructions',event.target.value)}/></details>
        <label className="flex items-center gap-3 rounded-box bg-base-200 p-4 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={draft.isPublished} onChange={event=>change('isPublished',event.target.checked)}/>Available to students when the lesson is published</label>
      </fieldset>
      {error?<p role="alert" className="text-sm text-error">{error}</p>:null}
      <div className="flex justify-end gap-2"><button type="button" className="btn btn-ghost" disabled={busy} onClick={close}>Cancel</button><button className="btn btn-neutral" disabled={busy}>{busy?'Saving…':'Save activity'}</button></div>
    </form>
  </StudioDialog>;
}
