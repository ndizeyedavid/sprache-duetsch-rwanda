import { FiExternalLink,FiVideo } from 'react-icons/fi';
import { useApi } from '../../hooks/useApi';
import { apiGet } from '../../lib/api';
import { ErrorBlock,LoadingBlock } from '../common/PageState';
import { Drawer } from '../ui/overlay/Drawer';
import { ClassJoinLink } from './ClassJoinLink';
import { SessionHeaderTimes } from './session-drawer/SessionHeaderTimes';
import { canJoinSession,statusText } from './session-drawer/status';
import type { StudentSessionDetail } from './StudentDetailDrawerContent';
import { StudentDetailDrawerContent } from './StudentDetailDrawerContent';

type Props = { id: string; open: boolean; title: string; onClose: () => void };

/** Loads one class for the student and shows it in the shared drawer (header appears instantly). */
export function StudentSessionDetails({ id, open, title, onClose }: Props) {
  const detail = useApi(`student-session-${id}`, () => apiGet<StudentSessionDetail>(`/sessions/me/${id}`), Boolean(id));
  const session = detail.data && detail.data.id === id ? detail.data : null;
  const live = session?.status === 'LIVE';
  return (
    <Drawer open={open} onClose={onClose} icon={FiVideo} title={session?.title || title || 'Class'}
      subtitle={session ? <SessionHeaderTimes startAt={session.startAt} endAt={session.endAt} timezone={session.timezone} /> : 'Loading…'}
      meta={session ? <span className={`hero-chip px-2.5 py-0.5 text-[0.6875rem] ${live ? 'hero-chip-solid' : ''}`}>{live ? '● ' : ''}{statusText(session)}</span> : null}
      footer={session?.meetingUrl && canJoinSession(session) ? (
        <ClassJoinLink sessionId={session.id} href={session.meetingUrl} className="btn btn-primary btn-sm w-full gap-1.5 rounded-full">
          <FiExternalLink aria-hidden />{live ? 'Join now' : 'Join live class'}
        </ClassJoinLink>
      ) : null}>
      {session ? <StudentDetailDrawerContent session={session} />
        : detail.error ? <ErrorBlock message={detail.error} onRetry={detail.refetch} /> : <LoadingBlock label="Loading class details…" />}
    </Drawer>
  );
}
