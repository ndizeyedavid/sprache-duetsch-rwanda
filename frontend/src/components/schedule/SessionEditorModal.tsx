import { FiClock,FiGlobe,FiRepeat,FiTrash2,FiVideo } from 'react-icons/fi';
import { Dialog } from '../ui/overlay/Dialog';
import { SessionEditorFields } from './session-editor/SessionEditorFields';
import { useSessionDraft,type EditingSession } from './session-editor/useSessionDraft';

type Props = {
  open: boolean; onClose: () => void; classes: { id: string; name: string; code: string }[]; editing?: EditingSession | null;
  /** `yyyy-MM-dd`, or `yyyy-MM-ddTHH:mm` when a time slot was clicked (class defaults to 90 minutes). */
  initialDate?: string | null; onSaved: () => void;
  /** Editing only: offer deleting the class (opens the delete confirmation). */
  onDelete?: (id: string) => void;
};

const FORM_ID = 'session-editor-form';

/** Create or edit a live class in the shared red dialog; the save button stays pinned in view. */
export function SessionEditorModal({ open, onClose, classes, editing, initialDate, onSaved, onDelete }: Props) {
  const draft = useSessionDraft({ open, editing, classes, initialDate, onSaved, onClose });
  const { locked, saving, minutes, values } = draft;
  const chip = 'hero-chip px-2.5 py-0.5 text-[0.6875rem]';
  return (
    <Dialog open={open} onClose={onClose} busy={saving} icon={FiVideo} size="md"
      title={editing ? 'Edit live class' : 'New live class'}
      subtitle={locked ? 'This class has ended — you can still add notes or a recording.' : 'Students are notified as soon as you save.'}
      meta={<>
        <span className={chip}><FiGlobe aria-hidden />{draft.zone.replaceAll('_', ' ')}</span>
        {minutes > 0 ? <span className={`${chip} hero-chip-solid`}><FiClock aria-hidden />{minutes} min</span> : null}
        {values.repeat && !editing ? <span className={chip}><FiRepeat aria-hidden />{values.weeks} weeks</span> : null}
      </>}
      footer={<>
        {editing && onDelete && !['LIVE', 'COMPLETED'].includes(editing.status ?? '') ? (
          <button type="button" disabled={saving} className="btn btn-ghost btn-sm mr-auto gap-1.5 rounded-full text-error" onClick={() => onDelete(editing.id)}><FiTrash2 aria-hidden />Delete</button>
        ) : null}
        <button type="button" disabled={saving} className="btn btn-ghost btn-sm rounded-full" onClick={onClose}>Cancel</button>
        <button type="submit" form={FORM_ID} disabled={saving || draft.inPast} className="btn btn-primary btn-sm rounded-full px-5">
          {saving ? <span className="loading loading-spinner loading-xs" /> : null}
          {saving ? 'Saving…' : editing ? 'Save changes' : values.repeat ? `Schedule ${values.weeks} classes` : 'Schedule class'}
        </button>
      </>}>
      <form id={FORM_ID} onSubmit={draft.submit}>
        <SessionEditorFields draft={draft} classes={classes} editing={Boolean(editing)} />
      </form>
    </Dialog>
  );
}
