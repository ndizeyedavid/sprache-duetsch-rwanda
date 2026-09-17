import { FiCalendar, FiClock, FiEdit2, FiExternalLink, FiMapPin, FiTrash2, FiVideo } from 'react-icons/fi';
import { isoTime } from '../../lib/services';
import { sessionStatusLabel, sessionTone, teacherName } from '../../lib/sessions-ui';
import { TONE_CLASSES } from '../../lib/theme';
import { RowMenu } from '../assessments/RowMenu';

type Props = {
 session: { id: string; title: string; startAt: string; endAt: string; status: string; mode: string; meetingUrl: string | null; teacher: { firstName: string; lastName: string } | null; classGroup: { name: string } | null; room?: string | null };
 onOpen: () => void;
 onEdit: () => void;
 onCancel: () => void;
};

export function SessionRow({ session, onOpen, onEdit, onCancel }: Props) {
 const tone = sessionTone(session.status);
 const tc = TONE_CLASSES[tone];
 const time = `${isoTime(session.startAt)} – ${isoTime(session.endAt)}`;
 return (
 <div className="flex gap-3 rounded-box border border-line bg-base-100 p-3 transition hover:">
 <span className="w-1 shrink-0 self-stretch rounded-full" style={{ background: tc.hex }} aria-hidden />
 <button type="button" onClick={onOpen} className="min-w-0 grow text-left">
 <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
 <span className="inline-flex items-center gap-1 rounded-full bg-base-200 px-2 py-0.5 font-medium text-ink">{session.classGroup?.name ?? '—'}</span>
 <span className="inline-flex items-center gap-1"><FiClock aria-hidden />{time}</span>
 <span className={`rounded-full px-2 py-0.5 font-medium ${tc.soft} ${tc.text}`}>{sessionStatusLabel(session.status)}</span>
 <span className="inline-flex items-center gap-1">{session.mode === 'ONSITE' ? <FiMapPin aria-hidden /> : <FiVideo aria-hidden />}{session.mode}</span>
 {session.room ? <span className="inline-flex items-center gap-1"><FiMapPin aria-hidden />{session.room}</span> : null}
 </div>
 <p className="mt-1 truncate text-sm font-semibold leading-tight">{session.title || 'Untitled session'}</p>
 <p className="truncate text-xs text-muted">{teacherName(session.teacher)}</p>
 </button>
 <div className="flex shrink-0 flex-col items-end gap-2">
 {session.meetingUrl ? <a href={session.meetingUrl} target="_blank" rel="noreferrer" className="btn btn-xs gap-1 rounded-full border-0 bg-brand text-white hover:bg-brand/90"><FiExternalLink aria-hidden />Join</a> : <span className="text-[11px] text-muted">No link</span>}
 <RowMenu
 label={`Actions for ${session.title || 'session'}`}
 items={[
 { label: 'View details', icon: FiCalendar, onClick: onOpen },
 { label: 'Edit session', icon: FiEdit2, onClick: onEdit },
 { label: 'Cancel session', icon: FiTrash2, onClick: onCancel, tone: 'danger' as const },
 ]}
 />
 </div>
 </div>
 );
}
