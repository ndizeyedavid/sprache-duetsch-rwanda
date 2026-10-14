import { FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export function CoursePaymentLock({ title }: { title: string }) {
  return <section className="card border border-base-300 bg-base-200 p-6 sm:p-10">
    <FiLock className="text-3xl text-muted" aria-hidden />
    <h1 className="mt-4 text-xl font-semibold">{title}</h1>
    <p className="mt-2 text-sm leading-6 text-muted">You have a place in this course. Pay the course fee to open lessons, notes and tests.</p>
    <div className="mt-5 flex flex-wrap gap-2"><Link className="btn" to="/profile?view=payments">Pay for your course</Link><Link className="btn btn-ghost" to="/courses">My courses</Link></div>
  </section>;
}
