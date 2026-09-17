import { FiClock, FiExternalLink, FiLink, FiMapPin, FiVideo, FiX, FiCalendar, FiUser } from 'react-icons/fi';
import { isoDate, isoTime } from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';

type Session = { id: string; title: string; startAt: string; endAt: string; timezone: string | null; mode: string; provider: string | null; status: string; meetingUrl: string | null; room: string | null; notes: string | null; recordingUrl?: string | null; teacher: { firstName: string; lastName: string } | null; classGroup: { id: string; name: string } | null };

type Props = { open: boolean; onClose: () => void; session: Session | null; onEdit: () => void; onCancel: () => void; onReschedule: () => void };

export function SessionDetailDrawer({ open, onClose, session, onEdit, onCancel, onReschedule }: Props) {
 if (!open || !session) return null;
 const tone = sessionTone(session.status);
 const tc = TONE_CLASSES[tone];
 return (
 <div className="fixed inset-0 z-40 flex justify-end">
 <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
 <div className="relative flex h-full w-full max-w-md flex-col bg-base-100">
 <div className="shrink-0 border-b border-line p-5 pr-12">
 <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${tc.soft} ${tc.text}`}>{sessionStatusLabel(session.status)}</span>
 <h3 className="mt-2 text-base font-bold leading-tight">{session.title || 'Untitled session'}</h3>
 <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
 <FiCalendar aria-hidden />{isoDate(session.startAt)} · {isoTime(session.startAt)} – {isoTime(session.endAt)}
 {session.timezone ? ` · ${session.timezone}` : ''}
 </p>
 <button type="button" onClick={onClose} className="btn btn-ghost btn-xs btn-circle absolute right-3 top-3"><FiX aria-hidden /></button>
 </div>
 <div className="flex-1 overflow-y-auto p-5">
 <div className="space-y-4">
 <div className="rounded-box bg-base-200 p-4">
 <p className="flex items-center gap-2 text-xs font-semibold"><FiUser aria-hidden className="text-brand" />Class & teacher</p>
 <p className="mt-1 text-sm font-medium">{session.classGroup?.name ?? '—'}</p>
 <p className="text-xs text-muted">{teacherName(session.teacher)}</p>
 <p className="mt-2 flex items-center gap-2 text-xs text-muted"><FiClock aria-hidden />{session.mode} {session.provider ? `· ${session.provider.replace('_', ' ')}` : ''}</p>
 {session.room ? <p className="flex items-center gap-2 text-xs text-muted"><FiMapPin aria-hidden />Room: {session.room}</p> : null}
 </div>
 {session.meetingUrl ? (
 <div className="rounded-box border border-brand/20 bg-brand-soft/40 p-4">
 <p className="flex items-center gap-2 text-xs font-bold text-[#B30A00]"><FiVideo aria-hidden />Meeting link</p>
 <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-2 break-all text-sm font-medium text-brand hover:underline"><FiLink aria-hidden />{session.meetingUrl}</a>
 <div className="mt-3 flex gap-2"><a href={session.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-sm gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"><FiExternalLink aria-hidden />Open</a><button type="button" onClick={() => navigator.clipboard.writeText(session.meetingUrl ?? '')} className="btn btn-sm rounded-full border-line bg-white">Copy link</button></div>
 </div>
 ) : <p className="rounded-box border border-dashed border-line bg-base-200/30 p-4 text-center text-xs text-muted">No meeting link — add one when editing.</p>}
 {session.recordingUrl ? <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-xs font-medium text-brand hover:underline"><FiVideo aria-hidden />Recording</a> : null}
 {session.notes ? <div className="rounded-box border border-line bg-base-100 p-4"><p className="text-xs font-semibold">Notes</p><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{session.notes}</p></div> : null}
 </div>
 </div>
 <div className="flex shrink-0 flex-wrap gap-2 border-t border-line bg-base-200/30 p-4">
 <button type="button" onClick={onEdit} className="btn btn-sm rounded-full border-line bg-white">Edit</button>
 <button type="button" onClick={onReschedule} className="btn btn-sm rounded-full border-line bg-white">Reschedule</button>
 <button type="button" onClick={onCancel} className="btn btn-sm rounded-full border-0 bg-coral text-white hover:bg-coral/90">Cancel</button>
 <button type="button" onClick={onClose} className="btn btn-sm ml-auto rounded-full border-line bg-base-100">Close</button>
 </div>
 </div>
 </div>
 );
}
