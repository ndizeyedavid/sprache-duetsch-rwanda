import { FiArrowRight,FiAward,FiCheck,FiClock,FiLock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import type { ExamCentreTest } from '../../lib/services/exam-centre';

function state(test: ExamCentreTest): { label: string; passed: boolean; open: boolean } {
  const open = !test.opensAfter || test.opensAfter.completed;
  const last = test.latest;
  if (!open) return { label: `Opens after lesson ${test.opensAfter?.order ?? ''}: ${test.opensAfter?.title ?? ''}`, passed: false, open };
  if (!last) return { label: 'Not taken yet', passed: false, open };
  if (last.status === 'IN_PROGRESS') return { label: 'In progress', passed: false, open };
  if (last.status !== 'GRADED') return { label: 'Waiting for your teacher', passed: false, open };
  const percent = last.maxScore ? Math.round(Number(last.score ?? 0) / last.maxScore * 100) : 0;
  return { label: `${percent}% · ${last.passed ? 'passed' : `pass mark ${test.passMark}%`}`, passed: last.passed === true, open };
}

/** The course's module tests and its mock final exam, in course order, with their state. */
export function ExamTests({ tests, slug }: { tests: ExamCentreTest[]; slug: string }) {
  if (!tests.length) return <p className="rounded-field border border-dashed border-base-300 p-4 text-sm text-muted">Module tests and the mock exam for this course are coming soon.</p>;
  return (
    <ul className="grid gap-2 md:grid-cols-2">
      {tests.map((test) => {
        const { label, passed, open } = state(test);
        const icon = passed ? <FiCheck aria-hidden /> : open ? <FiAward aria-hidden /> : <FiLock aria-hidden />;
        const body = <>
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-full text-lg ${passed ? 'bg-ok-soft text-ok' : open ? 'bg-primary text-primary-content' : 'bg-base-200 text-muted'}`}>{icon}</span>
          <span className="min-w-0 grow">
            <span className="block font-semibold leading-tight" lang="de">{test.title}</span>
            <span className="text-xs text-muted">{test.type === 'FINAL_EXAM' ? 'Mock exam' : 'Module test'} · {test.questions} questions{test.durationMinutes ? <> · <FiClock aria-hidden className="inline" /> {test.durationMinutes} min</> : null}</span>
            <span className="block text-xs text-muted">{label}</span>
          </span>
        </>;
        return <li key={test.id}>
          {open ? <Link to={`/assignments/ASM-${test.id}`} className="flex items-center gap-3 rounded-box border border-base-300 bg-base-100 p-3 transition-colors hover:border-primary">{body}<FiArrowRight aria-hidden className="shrink-0 text-muted" /></Link>
            : <Link to={`/courses/${slug}/learn/${test.opensAfter?.lessonId ?? ''}`} className="flex items-center gap-3 rounded-box border border-dashed border-base-300 bg-base-100 p-3" aria-label={`${test.title}: ${label}. Go to the lesson.`}>{body}</Link>}
        </li>;
      })}
    </ul>
  );
}
