import { CoursePaymentLock } from './CoursePaymentLock';
import { FiArrowUpRight,FiBookOpen,FiCheck,FiPlay } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyCourse } from '../../lib/services';

type Props = { courses: MyCourse[]; course: MyCourse; onSelect: (id: string) => void };

export function DashboardCoursePanel({ courses, course, onSelect }: Props) {
  if (course.paymentRequired) return <div className="space-y-3">
    <div className="flex flex-wrap gap-2">{courses.map(item => <button key={item.level.id} type="button" className="btn btn-sm" aria-pressed={item.level.id === course.level.id} onClick={() => onSelect(item.level.id)}>{item.level.code}</button>)}</div>
    <CoursePaymentLock title={course.level.title} />
  </div>;
  const modules = [...course.modules].sort((a, b) => a.order - b.order);
  const next = modules.flatMap((module) => [...module.lessons].sort((a, b) => a.order - b.order)).find((lesson) => lesson.progressStatus !== 'COMPLETED');
  const base = `/courses/${course.level.code.toLowerCase()}`;
  return (
    <section className="card learning-panel h-full gap-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-base font-semibold"><FiBookOpen aria-hidden />My learning</h2>
        <Link to="/courses" className="btn btn-ghost btn-xs gap-2 rounded-full">All courses <FiArrowUpRight aria-hidden /></Link>
      </div>
      {courses.length > 1 ? <div className="flex flex-wrap gap-2" aria-label="Choose a course">
        {courses.map((item) => <button key={item.level.id} type="button" aria-pressed={item.level.id === course.level.id} onClick={() => onSelect(item.level.id)} className={`btn btn-xs rounded-full ${item.level.id === course.level.id ? 'btn-neutral' : 'btn-ghost'}`}>{item.level.code}</button>)}
      </div> : null}
      <div className="flex items-center gap-4">
        <span aria-hidden className="bg-primary text-primary-content grid size-14 shrink-0 place-items-center rounded-xl text-xl font-semibold">{course.level.code}</span>
        <div className="min-w-0 flex-1"><Link to={base} className="text-sm font-semibold hover:underline">{course.level.title}</Link>
          <div className="mt-2 flex items-center gap-3"><progress className="progress progress-primary h-1.5 flex-1" value={course.stats.completionPercentage} max={100} aria-label="Course progress" /><span className="text-xs font-semibold">{course.stats.completionPercentage}%</span></div>
          <p className="mt-1.5 text-[10px] text-muted">{course.stats.completedLessons}/{course.stats.totalLessons} lessons</p>
        </div>
      </div>
      <ol className="space-y-2">
        {modules.map((module, index) => {
          const lessons = [...module.lessons].sort((a, b) => a.order - b.order);
          const done = lessons.filter((lesson) => lesson.progressStatus === 'COMPLETED').length;
          const current = lessons.some((lesson) => lesson.id === next?.id);
          const target = lessons.find((lesson) => lesson.progressStatus === 'IN_PROGRESS') ?? lessons.find((lesson) => lesson.progressStatus !== 'COMPLETED') ?? lessons[0];
          return <li key={module.id}><Link to={target ? `${base}/learn/${target.id}` : `${base}/learn`} className={`flex flex-wrap items-center gap-3 rounded-field border p-3 sm:flex-nowrap ${current ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100'}`}>
            <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-base-100 text-xs font-semibold">{done === lessons.length && done ? <FiCheck /> : index + 1}</span>
            <div className="min-w-0 flex-1"><h3 className="text-xs font-semibold">{module.title}</h3>
              <div className="mt-2 flex flex-wrap gap-1.5" aria-label={`${done} of ${lessons.length} lessons completed`}>
                {lessons.map((lesson) => <span key={lesson.id} aria-hidden className={`grid size-5 place-items-center rounded-full border text-[9px] ${lesson.progressStatus === 'COMPLETED' ? 'border-primary bg-primary text-primary-content' : lesson.id === next?.id ? 'border-primary bg-primary text-primary-content' : 'border-base-300 bg-base-100'}`}>{lesson.progressStatus === 'COMPLETED' ? <FiCheck /> : lesson.id === next?.id ? <FiPlay /> : null}</span>)}
              </div>
            </div><FiArrowUpRight aria-hidden className="shrink-0 text-muted" />
          </Link></li>;
        })}
      </ol>
      {modules.length === 0 ? <p className="text-xs text-muted">Your teacher is preparing your modules.</p> : null}
      <Link to={`${base}/learn`} className="btn btn-sm mt-auto w-full justify-between rounded-full border-base-300 bg-base-100">Open lesson map <FiArrowUpRight aria-hidden /></Link>
    </section>
  );
}
