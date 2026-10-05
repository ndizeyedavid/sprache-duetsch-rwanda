import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { MyAssessment } from '../../lib/services';

export function GradesWelcome({ assessments }: { assessments: MyAssessment[] }) {
  const next = assessments.find(a => a.latestStatus === 'IN_PROGRESS') ?? assessments.find(a => a.attemptCount === 0);
  const pending = assessments.filter(a => a.latestStatus === 'SUBMITTED' && a.bestScore === null).length;
  return <section className="card flex-row items-center justify-between gap-4 border border-base-300/70 bg-base-100 p-5 sm:p-6"><div className="min-w-0"><p className="text-[10px] uppercase tracking-widest text-base-content/50">Your learning, at a glance</p><h1 className="mt-1 text-2xl font-semibold">Results & feedback</h1><p className="mt-2 text-xs text-base-content/60">{pending ? `${pending} submission${pending === 1 ? '' : 's'} awaiting grading.` : 'See how you’re doing and choose your next step.'}</p>{next ? <Link to={`/assignments/ASM-${next.id}`} className="btn btn-neutral btn-sm mt-4 rounded-full">{next.latestStatus === 'IN_PROGRESS' ? 'Continue' : 'Up next'}: {next.title}<FiArrowRight aria-hidden /></Link> : <Link to="/courses" className="btn btn-neutral btn-sm mt-4 rounded-full">Continue learning<FiArrowRight aria-hidden /></Link>}</div><img src="/illustrations/learning-owl.webp" alt="" width={480} height={400} className="hidden h-28 w-32 shrink-0 object-contain sm:block" /></section>;
}
