import { FiBookOpen,FiCheckSquare,FiClipboard,FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { TeachingOverview } from './dashboard-data';
export function TeachingStats({ data:d }: { data:TeachingOverview }) {
  const stats=[{label:'Active classes',value:d.classesCount,hint:'Your teaching groups',Icon:FiBookOpen,to:'/teacher/classes',tone:'bg-neutral text-neutral-content'},{label:'Learners',value:d.studentsCount,hint:'Active students in your classes',Icon:FiUsers,to:'/teacher/classes',tone:'bg-info text-info-content'},{label:'To review',value:d.pendingGradingCount+d.pendingHomeworkCount+d.pendingActivityCount,hint:'Homework and assessments',Icon:FiClipboard,to:'/teacher/grading',tone:'bg-warning text-warning-content'},{label:'Attendance to mark',value:d.attendanceNeeds.length,hint:'Sessions in the last 30 days',Icon:FiCheckSquare,to:'/teacher/attendance',tone:'bg-success text-success-content'}];
  return <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map(s=><Link key={s.label} to={s.to} className="card bg-base-100 p-4 transition-colors hover:bg-base-200/60 sm:p-5"><span className={`mb-4 grid size-9 place-items-center rounded-xl ${s.tone}`}><s.Icon aria-hidden size={18}/></span><p className="text-xs text-base-content/60">{s.label}</p><p className="mt-1 text-3xl font-semibold">{s.value}</p></Link>)}</div>;
}
