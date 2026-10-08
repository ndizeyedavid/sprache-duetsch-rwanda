import { Link } from 'react-router-dom';
import { EmptyBlock,ErrorBlock,LoadingBlock } from '../../components/common/PageState';
import { loadTeachingOverview } from '../../components/teacher/dashboard-data';
import { TeacherDashboardHero } from '../../components/teacher/TeacherDashboardHero';
import { TeachingActionRail } from '../../components/teacher/TeachingActionRail';
import { TeachingClassCard } from '../../components/teacher/TeachingClassCard';
import { TeachingStats } from '../../components/teacher/TeachingStats';
import { useApi } from '../../hooks/useApi';
import { listClasses } from '../../lib/services';
import { useSession } from '../../lib/session';
import { listMyTeachingLevels } from '../../lib/teaching';
export function TeacherDashboard(){
  const {user}=useSession();
  const overview=useApi('teaching-overview',loadTeachingOverview),classes=useApi('teacher-classes',listClasses),levels=useApi('my-teaching-levels',listMyTeachingLevels);
  const loading=overview.loading||classes.loading||levels.loading,error=overview.error||classes.error||levels.error;
  const refresh=()=>{overview.refetch();classes.refetch();levels.refetch();};
  if(loading)return <LoadingBlock label="Loading your teaching workspace…"/>;
  if(error)return <ErrorBlock message={error} onRetry={refresh}/>;
  return <div className="space-y-5"><TeacherDashboardHero name={user?.firstName??'teacher'}/>{overview.data?<TeachingStats data={overview.data}/>:null}<div className="grid items-start gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]"><section className="min-w-0"><div className="mb-4 flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold">Your classes</h2></div><Link to="/teacher/classes" className="btn btn-sm btn-ghost">All classes →</Link></div>{classes.data?.filter(g=>g.isActive).length?<div className="grid gap-4 md:grid-cols-2">{classes.data.filter(g=>g.isActive).map(g=>{const pending=overview.data?.gradingByClass.find(c=>c.classGroupId===g.id);return <TeachingClassCard key={g.id} group={g} pending={(pending?.assessments??0)+(pending?.homework??0)}/>;})}</div>:<div className="card border border-base-300 bg-base-100 p-8"><EmptyBlock title="Your classroom is getting ready" hint="Academic staff will assign your classes."/><Link to="/teacher/content" className="btn btn-sm mt-4 self-start">View teaching content</Link></div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-box bg-neutral p-5 text-neutral-content"><div><p className="text-sm font-semibold">Your next lesson</p></div><Link to="/teacher/content" className="btn btn-sm">Prepare →</Link></div></section>{overview.data?<TeachingActionRail data={overview.data}/>:null}</div></div>;
}
