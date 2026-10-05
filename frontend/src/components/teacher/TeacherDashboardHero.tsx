import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
export function TeacherDashboardHero({ name }: { name:string }) {
  const date=new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'});
  return <section className="card overflow-hidden bg-base-100"><div className="grid items-center gap-5 p-6 grid-cols-[minmax(0,1fr)_auto] sm:p-8"><div><p className="flex items-center gap-2 text-xs text-base-content/55"><FiCalendar aria-hidden/>{date}</p><h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-4xl">Hello, {name}.</h1><div className="mt-5 flex flex-wrap gap-2"><Link to="/teacher/schedule" className="btn btn-neutral btn-sm">Schedule<FiArrowRight aria-hidden/></Link><Link to="/teacher/assignments" className="btn btn-ghost btn-sm">Assignments</Link></div></div><div className="flex h-28 w-24 items-center justify-center rounded-3xl bg-base-200 sm:h-52 sm:w-56"><img src="/illustrations/course-learner.webp" width={224} height={208} alt="" className="h-24 w-24 object-contain sm:h-48 sm:w-52"/></div></div></section>;
}
