import { AttendanceHero } from '../../components/attendance/AttendanceHero';
import { AttendanceRegister } from '../../components/attendance/AttendanceRegister';
import { AttendanceSessionList } from '../../components/attendance/AttendanceSessionList';
import { useAttendanceRegister } from '../../components/attendance/useAttendanceRegister';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { useStaffPortal } from '../../components/teacher/useStaffPortal';
export function TeacherAttendance(){
  const r=useAttendanceRegister(),{admin}=useStaffPortal();
  const held=r.sessions.data?r.sessions.data.filter(s=>s.status!=='CANCELLED'&&Date.parse(s.startAt)<=Date.now()).length:undefined;
  return <div className="space-y-5"><AttendanceHero admin={admin} held={held} unsaved={Object.keys(r.draft).length}/>{r.sessions.loading?<LoadingBlock label="Loading class sessions…"/>:r.sessions.error?<ErrorBlock message={r.sessions.error} onRetry={r.sessions.refetch}/>:<div className="grid items-start gap-5 lg:grid-cols-[18.75rem_minmax(0,1fr)]"><AttendanceSessionList sessions={r.sessions.data??[]} id={r.id} onPick={r.pick} disabled={r.saving}/>{!r.id?<section className="card border border-base-300 bg-base-100 p-10"><EmptyBlock title="Choose a class session" hint="View and mark its students."/></section>:r.roster.loading||r.roster.stale?<LoadingBlock label="Loading student register…"/>:r.roster.error?<ErrorBlock message={r.roster.error} onRetry={r.roster.refetch}/>:r.selected?<AttendanceRegister key={r.id} session={r.selected} rows={r.rows} draft={r.draft} editable={r.editable} saving={r.saving} error={r.error} saved={r.saved} change={r.change} discard={r.discard} save={r.save}/>:<EmptyBlock title="Session unavailable" hint="Choose a session you have permission to manage."/>}</div>}</div>;
}
