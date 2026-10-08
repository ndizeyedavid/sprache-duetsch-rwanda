import { FiArrowLeft, FiEye, FiSave, FiSend } from 'react-icons/fi';
import type { TaskDraft } from '../task-types';
import { kindMeta } from '../task-types';

type Props = { draft: TaskDraft; existing: boolean; dirty: boolean; saving: boolean; onBack: () => void; onPreview: () => void; onSave: (publish: boolean) => void };

export function StudioTopBar({ draft: d, existing, dirty, saving, onBack, onPreview, onSave }: Props) {
  const published = d.status === 'PUBLISHED';
  return (
    <header className="flex flex-wrap items-center gap-3">
      <button type="button" className="btn btn-ghost btn-sm btn-square" aria-label="Back to assignments" onClick={onBack}><FiArrowLeft aria-hidden /></button>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-brand">{existing ? 'Edit' : 'New'} {kindMeta(d.kind).label.toLowerCase()}</p>
        <h1 className="truncate text-lg font-semibold">{d.title || 'Untitled'}</h1>
      </div>
      <span className="text-xs text-muted" role="status">{saving ? 'Saving…' : dirty ? 'Unsaved changes' : existing ? 'All changes saved' : ''}</span>
      <button type="button" className="btn btn-ghost btn-sm rounded-full xl:hidden" onClick={onPreview}><FiEye aria-hidden />Preview</button>
      {!published ? <button type="button" className="btn btn-sm rounded-full border-base-300" disabled={saving} onClick={() => onSave(false)}><FiSave aria-hidden />Save draft</button> : null}
      <button type="button" className="btn btn-sm rounded-full border-0 bg-brand text-white hover:bg-brand/90" disabled={saving} onClick={() => onSave(true)}>
        {saving ? <span className="loading loading-spinner loading-xs" aria-hidden /> : <FiSend aria-hidden />}{published ? 'Save changes' : 'Publish'}
      </button>
    </header>
  );
}
