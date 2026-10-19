import { FiEdit2,FiRepeat,FiTrash2,FiVideo,FiXCircle } from 'react-icons/fi';
import { Drawer } from '../ui/overlay/Drawer';
import { CancelReasonNote } from './CancelReasonNote';
import { MeetingCard } from './session-drawer/MeetingCard';
import { SessionFacts } from './session-drawer/SessionFacts';
import { SessionHeaderTimes } from './session-drawer/SessionHeaderTimes';
import { isClosed,statusText } from './session-drawer/status';
import { useLastValue } from './session-drawer/useLastValue';
import { SessionLifecycle } from './SessionLifecycle';
import type { SessionMaterial } from './SessionMaterials';
import { SessionMaterials } from './SessionMaterials';

type Session = { id: string; title: string; startAt: string; endAt: string; timezone: string | null; mode: string; provider: string | null; status: string; cancelReason?: string | null; meetingUrl: string | null; room: string | null; notes: string | null; recordingUrl?: string | null; materials?: SessionMaterial[]; teacher: { firstName: string; lastName: string } | null; classGroup: { id: string; name: string } | null };

type Props = { open: boolean; onClose: () => void; session: Session | null; onEdit: () => void; onCancel: () => void; onReschedule: () => void; onDelete?: () => void; onSaved?: () => void };

/** Staff view of one class: status, times, lifecycle, link, materials and the actions to change it. */
export function SessionDetailDrawer({ open, onClose, session: current, onEdit, onCancel, onReschedule, onDelete, onSaved }: Props) {
  const session = useLastValue(current);
  if (!session) return null;
  const closed = isClosed(session);
  const live = session.status === 'LIVE';
  return (
    <Drawer open={open && Boolean(current)} onClose={onClose} icon={FiVideo} title={session.title || 'Untitled class'}
      subtitle={<SessionHeaderTimes startAt={session.startAt} endAt={session.endAt} timezone={session.timezone} />}
      meta={<span className={`hero-chip px-2.5 py-0.5 text-[0.6875rem] ${live ? 'hero-chip-solid' : ''}`}>{live ? '● ' : ''}{statusText(session)}</span>}
      footer={<>
        <button type="button" onClick={onEdit} className="btn btn-sm gap-1.5 rounded-full border-line bg-base-100"><FiEdit2 aria-hidden />Edit</button>
        <button type="button" onClick={onReschedule} disabled={closed || live} className="btn btn-sm gap-1.5 rounded-full border-line bg-base-100"><FiRepeat aria-hidden />Reschedule</button>
        <button type="button" onClick={onCancel} disabled={closed} className="btn btn-sm gap-1.5 rounded-full border-error bg-base-100 text-error hover:bg-error hover:text-error-content"><FiXCircle aria-hidden />Cancel class</button>
        {onDelete ? <button type="button" onClick={onDelete} disabled={live || session.status === 'COMPLETED'} title="Delete a class created by mistake" aria-label="Delete class"
          className="btn btn-ghost btn-sm btn-circle ml-auto text-error"><FiTrash2 aria-hidden /></button> : null}
      </>}>
      <div className="space-y-4">
        <CancelReasonNote status={session.status} reason={session.cancelReason} />
        <SessionFacts classGroup={session.classGroup} teacher={session.teacher} mode={session.mode} provider={session.provider} room={session.room} />
        {session.meetingUrl && !closed ? <MeetingCard sessionId={session.id} url={session.meetingUrl} live={live} joinLabel={live ? 'Join now' : 'Open meeting'} />
          : <p className="rounded-box border border-dashed border-line bg-base-200 p-4 text-center text-xs text-muted">{closed ? 'This class is closed.' : 'No meeting link yet — add one with Edit.'}</p>}
        <SessionLifecycle session={session} onSaved={onSaved ?? (() => {})} />
        <SessionMaterials id={session.id} materials={session.materials ?? []} manage onSaved={onSaved} />
        {session.recordingUrl ? <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-sm w-full gap-1.5 rounded-full border-line bg-base-100"><FiVideo aria-hidden />Watch recording</a> : null}
        {session.notes ? <section className="rounded-box border border-line p-4"><h3 className="text-xs font-semibold">Notes</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{session.notes}</p></section> : null}
      </div>
    </Drawer>
  );
}
