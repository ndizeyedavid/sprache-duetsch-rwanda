import { FiTrash2 } from 'react-icons/fi';
import { StudioDialog } from '../StudioDialog';
import type { ChangeLesson,LessonDraft } from './lesson-draft';
import { formatNames } from './lesson-draft';

type Props = { draft: LessonDraft; change: ChangeLesson; busy: boolean; onClose: () => void; onDelete: () => void; onUnpublish: () => void };
export function LessonSettings({ draft, change, busy, onClose, onDelete, onUnpublish }: Props) {
  return <StudioDialog title="Lesson settings" onClose={onClose} busy={busy}>
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4"><label className="text-sm font-medium">Lesson format<select className="select mt-2 w-full" value={draft.contentType} onChange={event => change('contentType', event.target.value)}>{Object.entries(formatNames).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-sm font-medium">Minutes to complete<input type="number" min={0} max={1000} className="input mt-2 w-full" value={draft.estimatedMinutes} onChange={event => change('estimatedMinutes', event.target.value)}/></label></div>
      {draft.isPublished ? <button className="btn w-full" disabled={busy} onClick={onUnpublish}>Move lesson to draft</button> : null}
      <div className="flex items-center justify-between gap-3 rounded-box bg-base-200 p-4"><span className="text-sm">Remove this lesson</span><button className="btn btn-sm btn-ghost text-error" disabled={busy} onClick={onDelete}><FiTrash2 aria-hidden/>Delete</button></div>
      <button className="btn btn-neutral w-full" onClick={onClose}>Done</button>
    </div>
  </StudioDialog>;
}
