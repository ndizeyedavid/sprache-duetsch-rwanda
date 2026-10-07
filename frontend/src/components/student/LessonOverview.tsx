import { FiBookOpen,FiCheckCircle,FiMessageSquare } from 'react-icons/fi';
import type { StudentLesson } from '../../lib/services';
import { isBookPractice } from './course-practice-utils';

export function LessonOverview({ detail }: { detail: StudentLesson }) {
  const done = detail.progressStatus === 'COMPLETED';
  const submitted = detail.activities.filter(a => a.mySubmission);
  const feedback = detail.activities.filter(a => a.mySubmission?.feedback);
  return <section className="card journey-hero relative gap-4 border border-base-300/70 p-5">
    <img src="/illustrations/learning-owl.webp" alt="" aria-hidden="true" width={480} height={400} className="pointer-events-none absolute right-3 top-3 h-20 w-24 object-contain sm:right-5 sm:h-28 sm:w-32" />
    <div className="flex items-center gap-3 pr-20 sm:pr-32"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-base-100 text-primary">{done ? <FiCheckCircle aria-hidden /> : <FiBookOpen aria-hidden />}</span><div><p className="text-sm font-semibold">{done ? 'Lesson complete. Keep moving!' : 'Your next step: explore this lesson'}</p><p className="mt-1 text-xs text-primary-content">{done ? 'Your progress is saved.' : 'Read, practise, then mark it complete.'}</p></div></div>
    <div className="flex flex-wrap gap-2 pr-16 text-[11px] sm:pr-28"><a href="#lesson-content" className="btn btn-xs rounded-full bg-base-100 text-base-content">Read lesson</a>{detail.materials.length ? <a href="#lesson-resources" className="btn btn-xs rounded-full bg-base-100 text-base-content">{detail.materials.length} resources</a> : null}{detail.activities.length ? <a href={detail.activities.some(isBookPractice) ? "#course-reading" : "#lesson-practice"} className="btn btn-xs rounded-full bg-base-100 text-base-content">Practice · {submitted.length}/{detail.activities.length} submitted</a> : null}</div>
    {feedback.length ? <div className="rounded-xl border border-primary/10 bg-base-100 p-3 text-base-content"><p className="flex items-center gap-2 text-xs font-semibold"><FiMessageSquare aria-hidden />Teacher feedback</p>{feedback.map(a => <p key={a.id} className="mt-2 text-xs leading-relaxed"><span className="font-medium">{a.title}: </span>{a.mySubmission?.feedback}</p>)}</div> : submitted.length ? <p className="text-xs text-primary-content">{submitted.filter(a => a.mySubmission?.status === 'GRADED').length} graded · {submitted.filter(a => !isBookPractice(a) && a.mySubmission?.status !== 'GRADED').length} awaiting feedback</p> : null}
  </section>;
}
