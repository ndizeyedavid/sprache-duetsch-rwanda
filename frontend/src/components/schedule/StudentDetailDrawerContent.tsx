import { FiVideo } from 'react-icons/fi';
import { CancelReasonNote } from './CancelReasonNote';
import { MeetingCard } from './session-drawer/MeetingCard';
import { SessionFacts } from './session-drawer/SessionFacts';
import { canJoinSession } from './session-drawer/status';
import type { SessionMaterial } from './SessionMaterials';
import { SessionMaterials } from './SessionMaterials';

export type StudentSessionDetail = {
  id: string; title: string; startAt: string; endAt: string; timezone: string | null; mode: string; provider: string | null;
  status: string; cancelReason?: string | null; meetingUrl: string | null; room: string | null; notes: string | null;
  recordingUrl?: string | null; accessMessage?: string | null; materials?: SessionMaterial[];
  teacher: { firstName: string; lastName: string } | null; classGroup: { id: string; name: string } | null;
};

/** The student's drawer body: who/where, the join link, materials, recording and teacher notes. */
export function StudentDetailDrawerContent({ session }: { session: StudentSessionDetail }) {
  const canJoin = canJoinSession(session);
  return (
    <div className="space-y-4">
      <CancelReasonNote status={session.status} reason={session.cancelReason} />
      <SessionFacts classGroup={session.classGroup} teacher={session.teacher} mode={session.mode} provider={session.provider} room={session.room} />
      {session.meetingUrl && canJoin ? <MeetingCard sessionId={session.id} url={session.meetingUrl} live={session.status === 'LIVE'} joinLabel={session.status === 'LIVE' ? 'Join now' : 'Open class link'} />
        : <p className="rounded-box border border-dashed border-line bg-base-200 p-4 text-center text-xs text-muted">{session.accessMessage ?? (session.status === 'CANCELLED' ? 'Check your schedule for a replacement class.' : !canJoin ? 'This class has ended.' : 'Your teacher will add the meeting link before class.')}</p>}
      {!session.accessMessage ? <SessionMaterials id={session.id} materials={session.materials ?? []} /> : null}
      {session.recordingUrl ? <a href={session.recordingUrl} target="_blank" rel="noreferrer" className="btn btn-sm w-full gap-1.5 rounded-full border-line bg-base-100"><FiVideo aria-hidden />Watch recording</a> : null}
      {session.notes ? <section className="rounded-box border border-line p-4"><h3 className="text-xs font-semibold">Notes from your teacher</h3><p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">{session.notes}</p></section> : null}
    </div>
  );
}
